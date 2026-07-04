use crate::parsers::jest::models::JestReport;
use crate::test_models::{Test, TestStatus, TestSuite};
use crate::test_parser::TestParser;
use std::fs;
use std::path::Path;

pub struct JestParser;

impl TestParser for JestParser {
    fn parse(&self, file_path: &Path) -> Result<Vec<TestSuite>, String> {
        let content = fs::read_to_string(file_path).map_err(|e| format!("I/O error: {}", e))?;
        let report: JestReport = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        let suites = report
            .test_results
            .into_iter()
            .map(|file_result| {
                let raw_name = file_result.name.replace('\\', "/");
                let file_name = if let Some(idx) = raw_name.find("/cli/") {
                    raw_name[idx + 1..].to_string()
                } else {
                    raw_name
                };

                let tests = file_result
                    .assertion_results
                    .into_iter()
                    .map(|assertion| {
                        let status = match assertion.status.as_str() {
                            "passed" => TestStatus::Passed,
                            "failed" => TestStatus::Failed(assertion.failure_messages.join("\n")),
                            "pending" | "skipped" | "todo" => {
                                TestStatus::Skipped(assertion.failure_messages.join("\n"))
                            }
                            _ => TestStatus::Skipped(String::new()),
                        };

                        Test {
                            name: assertion.title,
                            time: assertion.duration.unwrap_or(0) as f64 / 1000.0,
                            status,
                            ancestor_titles: assertion
                                .ancestor_titles
                                .into_iter()
                                .filter(|s| !s.is_empty())
                                .collect(),
                        }
                    })
                    .collect();

                TestSuite {
                    name: file_name.clone(),
                    file: Some(file_name),
                    duration: 0.0,
                    timestamp: String::new(),
                    tests,
                }
            })
            .collect();

        Ok(suites)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn create_temp_json_file(content: &str) -> NamedTempFile {
        let mut file = NamedTempFile::new().expect("Failed to create temp file");
        file.write_all(content.as_bytes())
            .expect("Failed to write to temp file");
        file
    }

    #[test]
    fn parse_valid_jest_json() {
        let json_content = r#"{
            "testResults": [
                {
                    "name": "src/example.test.js",
                    "status": "failed",
                    "assertionResults": [
                        {
                            "title": "adds 1 + 2",
                            "fullName": "Math adds 1 + 2",
                            "status": "passed",
                            "ancestorTitles": ["Math"],
                            "duration": 5,
                            "failureMessages": []
                        },
                        {
                            "title": "fails",
                            "fullName": "Math fails",
                            "status": "failed",
                            "ancestorTitles": ["Math"],
                            "duration": 12,
                            "failureMessages": ["Expected 3 to equal 4"]
                        }
                    ]
                }
            ]
        }"#;
        let file = create_temp_json_file(json_content);
        let parser = JestParser;
        let result = parser.parse(file.path()).unwrap();

        assert_eq!(result.len(), 1);
        let suite = &result[0];
        assert_eq!(suite.name, "src/example.test.js");
        assert_eq!(suite.file, Some("src/example.test.js".to_string()));
        assert_eq!(suite.tests.len(), 2);

        assert_eq!(suite.tests[0].name, "adds 1 + 2");
        assert_eq!(suite.tests[0].time, 0.005);
        assert_eq!(suite.tests[0].status, TestStatus::Passed);
        assert_eq!(suite.tests[0].ancestor_titles, vec!["Math".to_string()]);

        assert_eq!(suite.tests[1].name, "fails");
        assert_eq!(suite.tests[1].time, 0.012);
        assert_eq!(
            suite.tests[1].status,
            TestStatus::Failed("Expected 3 to equal 4".to_string())
        );
        assert_eq!(suite.tests[1].ancestor_titles, vec!["Math".to_string()]);
    }
}
