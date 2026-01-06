use crate::parsers::junit::models::JunitTestSuite;
use crate::test::TestParser;
use crate::test_models::{Test, TestStatus, TestSuite};
use quick_xml::de::from_reader;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;

pub struct JunitParser;

impl TestParser for JunitParser {
    fn parse(&self, file_path: &Path) -> Result<Vec<TestSuite>, String> {
        let file = File::open(file_path).map_err(|e| format!("I/O error: {}", e))?;
        let reader = BufReader::new(file);

        let junit_suite: JunitTestSuite = from_reader(reader).map_err(|e| e.to_string())?;

        let mut methods = Vec::new();
        for case in junit_suite.test_cases {
            methods.push(Test {
                name: case.name,
                time: case.time,
                status: TestStatus::Passed,
            });
        }

        let suite = TestSuite {
            name: junit_suite.name,
            duration: junit_suite.time,
            timestamp: junit_suite.timestamp,
            methods,
        };

        Ok(vec![suite])
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
        assert!(
            result
                .unwrap_err()
                .contains("I/O error: The system cannot find the file specified")
        );
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
        assert_eq!(suite.methods.len(), 0);
    }

    #[test]
    fn simple_test_suite() {
        let xml_content = r#"
            <testsuite name="MyTestSuite" tests="2" failures="0" errors="0" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z">
                <testcase name="test_success_1" classname="com.example.MyClass" time="0.05"></testcase>
                <testcase name="test_success_2" classname="com.example.MyClass" time="0.07"/>
            </testsuite>
        "#;
        let file = create_temp_xml_file(xml_content);
        let parser = JunitParser;
        let result = parser.parse(&file.path());

        assert!(result.is_ok());
        let tests = result.unwrap();
        assert_eq!(tests.len(), 1);
        let suite = &tests[0];
        assert_eq!(suite.name, "MyTestSuite");
        assert_eq!(suite.duration, 0.123);
        assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
        assert_eq!(suite.methods.len(), 2);

        assert_eq!(suite.methods[0].name, "test_success_1");
        assert_eq!(suite.methods[0].time, 0.05);
        assert_eq!(suite.methods[0].status, TestStatus::Passed);

        assert_eq!(suite.methods[1].name, "test_success_2");
        assert_eq!(suite.methods[1].time, 0.07);
        assert_eq!(suite.methods[1].status, TestStatus::Passed);
    }
}
