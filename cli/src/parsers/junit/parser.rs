use crate::parsers::junit::models::{JunitRoot, JunitTestCase, JunitTestSuite};
use crate::test_models::{Test, TestStatus, TestSuite};
use crate::test_parser::TestParser;
use quick_xml::de::from_str;
use std::fs;
use std::path::Path;

pub struct JunitParser;

impl TestParser for JunitParser {
    fn parse(&self, file_path: &Path) -> Result<Vec<TestSuite>, String> {
        let suites = Self::deserialize_suites(file_path)?;
        Ok(Self::convert_to_test_suites(suites))
    }
}

impl JunitParser {
    fn deserialize_suites(file_path: &Path) -> Result<Vec<JunitTestSuite>, String> {
        let content = fs::read_to_string(file_path).map_err(|e| format!("I/O error: {}", e))?;
        let root: JunitRoot = from_str(&content).map_err(|e| e.to_string())?;

        match root {
            JunitRoot::TestSuites(suites) => Ok(suites.test_suites),
            JunitRoot::TestSuite(suite) => Ok(vec![suite]),
        }
    }

    fn convert_to_test_suites(suites: Vec<JunitTestSuite>) -> Vec<TestSuite> {
        suites
            .into_iter()
            .map(|junit_suite| {
                let tests = junit_suite
                    .test_cases
                    .into_iter()
                    .map(|case| Self::convert_to_test(case))
                    .collect();

                TestSuite {
                    name: junit_suite.name,
                    duration: junit_suite.time,
                    timestamp: junit_suite.timestamp,
                    tests,
                }
            })
            .collect()
    }

    fn convert_to_test(case: JunitTestCase) -> Test {
        let status = if let Some(failure) = case.failure {
            TestStatus::Failed(failure.message)
        } else if let Some(error) = case.error {
            TestStatus::Error(error.message)
        } else if let Some(skipped) = case.skipped {
            TestStatus::Skipped(skipped.message)
        } else {
            TestStatus::Passed
        };
        Test {
            name: case.name,
            time: case.time,
            status,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use parameterized::parameterized;
    use std::io::Write;
    use std::path::PathBuf;
    use tempfile::NamedTempFile;

    fn create_temp_xml_file(content: &str) -> NamedTempFile {
        let mut file = NamedTempFile::new().expect("Failed to create temp file");
        file.write_all(content.as_bytes())
            .expect("Failed to write to temp file");
        file
    }

    #[test]
    fn file_does_not_exist_expect_error() {
        let parser = JunitParser;
        let path = PathBuf::from("non_existent_file.xml");

        let result = parser.parse(&path);

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("I/O error:"));
    }

    #[parameterized(content = {
        r#"
            <testsuite>
            </testsuite>
        "#,
        r#"
            <testsuite />
        "#
    })]
    fn empty_test_suite_without_attributes(content: &str) {
        let file = create_temp_xml_file(content);

        let parser = JunitParser;
        let result = parser.parse(&file.path());

        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "");
        assert_eq!(suite.duration, 0.0);
        assert_eq!(suite.timestamp, "");
        assert_eq!(suite.tests.len(), 0);
    }

    #[parameterized(content = {
        r#"
            <testsuites>
            </testsuites>
        "#,
        r#"
            <testsuites />
        "#
    })]
    fn empty_test_suites_without_attributes(content: &str) {
        let file = create_temp_xml_file(content);

        let parser = JunitParser;
        let result = parser.parse(&file.path());

        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 0);
    }

    #[test]
    fn test_suite_with_all_passed_tests() {
        // Arrange
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="2" failures="0" errors="0" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z">
                <testcase name="test_success_1" classname="com.example.MyClass" time="0.05"></testcase>
                <testcase name="test_success_2" classname="com.example.MyClass" time="0.07"/>
            </testsuite>
        "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 0.123);
        assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
        assert_eq!(suite.tests.len(), 2);

        assert_eq!(suite.tests[0].name, "test_success_1");
        assert_eq!(suite.tests[0].time, 0.05);
        assert_eq!(suite.tests[0].status, TestStatus::Passed);

        assert_eq!(suite.tests[1].name, "test_success_2");
        assert_eq!(suite.tests[1].time, 0.07);
        assert_eq!(suite.tests[1].status, TestStatus::Passed);
    }

    #[test]
    fn test_suites_with_multiple_suites() {
        // Arrange
        let xml_content = r#"
            <testsuites>
                <testsuite name="MyTestSuite1" tests="1" failures="0" errors="0" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z">
                    <testcase name="test_success_1" classname="com.example.MyClass" time="0.05"></testcase>
                </testsuite>
                <testsuite name="MyTestSuite2" tests="1" failures="0" errors="0" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z">
                    <testcase name="test_success_2" classname="com.example.MyClass" time="0.07"/>
                </testsuite>
            </testsuites>
        "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 2);
        let suite1 = &tests[0];
        assert_eq!(suite1.name, "MyTestSuite1");
        assert_eq!(suite1.tests.len(), 1);
        let suite2 = &tests[1];
        assert_eq!(suite2.name, "MyTestSuite2");
        assert_eq!(suite2.tests.len(), 1);
    }

    #[test]
    fn test_suite_with_skipped_tests() {
        // Arrange
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="1" failures="0" errors="0" skipped="1" time="0.123" timestamp="2023-10-27T10:00:00Z">
                <testcase name="test" classname="com.example.MyClass" time="0.05">
                    <skipped message="Skipped test"/>
                </testcase>
            </testsuite>
        "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 0.123);
        assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
        assert_eq!(suite.tests.len(), 1);

        assert_eq!(suite.tests[0].name, "test");
        assert_eq!(suite.tests[0].time, 0.05);
        assert_eq!(
            suite.tests[0].status,
            TestStatus::Skipped("Skipped test".to_string())
        );
    }

    #[test]
    fn test_suite_with_skipped_tests_without_message() {
        // Arrange
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="1" failures="0" errors="0" skipped="1" time="0.123" timestamp="2023-10-27T10:00:00Z">
                <testcase name="test" classname="com.example.MyClass" time="0.05">
                    <skipped/>
                </testcase>
            </testsuite>
        "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 0.123);
        assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
        assert_eq!(suite.tests.len(), 1);

        assert_eq!(suite.tests[0].name, "test");
        assert_eq!(suite.tests[0].time, 0.05);
        assert_eq!(suite.tests[0].status, TestStatus::Skipped("".to_string()));
    }

    #[test]
    fn test_suite_with_failed_tests() {
        // Arrange
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="1" failures="1" errors="0" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z">
                <testcase name="test" classname="com.example.MyClass" time="0.05">
                    <failure message="Failed test">
                        <error type="java.lang.AssertionError">
                            Assertion failed
                        </error>
                    </failure>
                </testcase>
            </testsuite>
        "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 0.123);
        assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
        assert_eq!(suite.tests.len(), 1);

        assert_eq!(suite.tests[0].name, "test");
        assert_eq!(suite.tests[0].time, 0.05);
        assert_eq!(
            suite.tests[0].status,
            TestStatus::Failed("Failed test".to_string())
        )
    }

    #[test]
    fn test_suite_with_error_tests() {
        // Arrange
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="1" failures="0" errors="1" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z" >
                <testcase name="test" classname="com.example.MyClass" time="0.05">
                    <error message="Error test">
                        <error type="java.lang.RuntimeException">
                            Runtime error
                        </error>
                    </error>
                </testcase>
            </testsuite>
        "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 0.123);
        assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
        assert_eq!(suite.tests.len(), 1);

        assert_eq!(suite.tests[0].name, "test");
        assert_eq!(suite.tests[0].time, 0.05);
        assert_eq!(
            suite.tests[0].status,
            TestStatus::Error("Error test".to_string())
        );
    }

    #[test]
    fn test_suite_with_all_fields_and_all_types_of_tests() {
        // Arrange
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="3" failures="1" errors="1" skipped="1" time="1.234" timestamp="2024-10-27T10:00:00Z" assertions="20" file="tests/file">
                <testcase name="test_success" classname="com.example.MyClass" time="0.17" assertions="1" file="tests/file"/>
                <testcase name="test_failure" classname="com.example.MyClass" time="1.0">
                    <failure message="Failure message">
                        <error type="java.lang.AssertionError">
                            Assertion failed
                        </error>
                    </failure>
                </testcase>
                <testcase name="test_error" classname="com.example.MyClass" time="0.05">
                    <error message="Error message">
                        <error type="java.lang.RuntimeException">
                            Runtime error
                        </error>
                    </error>
                </testcase>
                <testcase name="test_skipped" classname="com.example.MyClass" time="0.02">
                    <skipped message="Skipped message"/>
                </testcase>
            </testsuite>
            "#;
        let file = create_temp_xml_file(xml_content);

        // Act
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        // Assert
        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 1.234);
        assert_eq!(suite.timestamp, "2024-10-27T10:00:00Z");
        assert_eq!(suite.tests.len(), 4);

        assert_eq!(suite.tests[0].name, "test_success");
        assert_eq!(suite.tests[0].time, 0.17);
        assert_eq!(suite.tests[0].status, TestStatus::Passed);

        assert_eq!(suite.tests[1].name, "test_failure");
        assert_eq!(suite.tests[1].time, 1.0);
        assert_eq!(
            suite.tests[1].status,
            TestStatus::Failed("Failure message".to_string())
        );

        assert_eq!(suite.tests[2].name, "test_error");
        assert_eq!(suite.tests[2].time, 0.05);
        assert_eq!(
            suite.tests[2].status,
            TestStatus::Error("Error message".to_string())
        );

        assert_eq!(suite.tests[3].name, "test_skipped");
        assert_eq!(suite.tests[3].time, 0.02);
        assert_eq!(
            suite.tests[3].status,
            TestStatus::Skipped("Skipped message".to_string())
        );
    }
}
