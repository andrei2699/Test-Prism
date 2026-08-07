use crate::parsers::generic::models::GenericMapping;
use crate::test_models::{Test, TestStatus, TestSuite};
use crate::test_parser::TestParser;
use serde_json_path::JsonPath;
use std::fs;
use std::path::Path;

pub struct GenericParser {
    mapping: GenericMapping,
}

impl GenericParser {
    pub fn from_mapping_file(path: &Path) -> Result<Self, String> {
        let mapping = GenericMapping::from_file(path)?;
        Ok(Self { mapping })
    }
    
    pub fn from_mapping_str(content: &str) -> Result<Self, String> {
        let mapping = GenericMapping::from_str(content)?;
        Ok(Self { mapping })
    }

    fn parse_value(&self, root: &serde_json::Value) -> Result<Vec<TestSuite>, String> {
        let suites_value = self.query(root, &self.mapping.suite_path)?;
        let suite_values = Self::as_array(suites_value);

        let mut suites = Vec::new();
        for suite_val in suite_values {
            suites.push(self.build_suite(&suite_val)?);
        }
        Ok(suites)
    }

    fn build_suite(&self, suite_val: &serde_json::Value) -> Result<TestSuite, String> {
        let name = self
            .query_optional(suite_val, &self.mapping.suite_name)
            .unwrap_or_default();
        let file = self
            .query_optional(suite_val, &self.mapping.suite_file)
            .filter(|s| !s.is_empty());
        let timestamp = self
            .query_optional(suite_val, &self.mapping.suite_timestamp)
            .unwrap_or_default();
        let duration = self
            .query_optional(suite_val, &self.mapping.suite_duration)
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);

        let tests_value = self.query(suite_val, &self.mapping.test_path)?;
        let test_values = Self::as_array(tests_value);

        let mut tests = Vec::new();
        for test_val in &test_values {
            tests.push(self.build_test(test_val)?);
        }

        Ok(TestSuite {
            name,
            file,
            duration,
            timestamp,
            tests,
        })
    }

    fn build_test(&self, test_val: &serde_json::Value) -> Result<Test, String> {
        let name = self.query_required(test_val, &self.mapping.test_name, "testName")?;
        let raw_status =
            self.query_required(test_val, &self.mapping.test_status, "testStatus")?;
        let status = self.map_status(&raw_status)?;

        let time = self
            .query_optional(test_val, &self.mapping.test_time)
            .and_then(|s| s.parse::<f64>().ok())
            .map(|t| self.convert_time(t))
            .unwrap_or(0.0);

        let message = self.query_optional(test_val, &self.mapping.test_message);

        let ancestor_titles = self
            .query_array(test_val, &self.mapping.test_ancestor_titles)
            .unwrap_or_default();

        let status = match status {
            TestStatus::Passed => TestStatus::Passed,
            TestStatus::Failed(_) => TestStatus::Failed(message.unwrap_or_default()),
            TestStatus::Skipped(_) => TestStatus::Skipped(message.unwrap_or_default()),
            TestStatus::Error(_) => TestStatus::Error(message.unwrap_or_default()),
        };

        Ok(Test {
            name,
            time,
            status,
            ancestor_titles,
        })
    }

    fn map_status(&self, raw: &str) -> Result<TestStatus, String> {
        match self.mapping.status_map.get(raw) {
            Some(target) => match target.as_str() {
                "passed" => Ok(TestStatus::Passed),
                "failed" => Ok(TestStatus::Failed(String::new())),
                "skipped" => Ok(TestStatus::Skipped(String::new())),
                "error" => Ok(TestStatus::Error(String::new())),
                other => Err(format!(
                    "Invalid statusMap target '{}': must be passed, failed, skipped, or error",
                    other
                )),
            },
            None => Err(format!(
                "Status '{}' not found in statusMap",
                raw
            )),
        }
    }

    fn convert_time(&self, time: f64) -> f64 {
        if self.mapping.time_unit == "ms" {
            time / 1000.0
        } else {
            time
        }
    }

    fn query(&self, root: &serde_json::Value, path: &str) -> Result<serde_json::Value, String> {
        let compiled = JsonPath::parse(path).map_err(|e| format!("Invalid path '{}': {}", path, e))?;
        let nodes = compiled.query(root);
        if nodes.is_empty() {
            return Ok(serde_json::Value::Null);
        }
        Ok(nodes[0].clone())
    }

    fn query_required(
        &self,
        root: &serde_json::Value,
        path: &str,
        field: &str,
    ) -> Result<String, String> {
        let val = self.query(root, path)?;
        match val {
            serde_json::Value::Null => Err(format!("Required field '{}' not found at '{}'", field, path)),
            serde_json::Value::String(s) => Ok(s),
            other => Ok(other.to_string().trim_matches('"').to_string()),
        }
    }

    fn query_optional(&self, root: &serde_json::Value, path: &Option<String>) -> Option<String> {
        let path = path.as_ref()?;
        let val = self.query(root, path).ok()?;
        match val {
            serde_json::Value::Null => None,
            serde_json::Value::String(s) => Some(s),
            serde_json::Value::Number(n) => Some(n.to_string()),
            serde_json::Value::Bool(b) => Some(b.to_string()),
            other => Some(other.to_string()),
        }
    }

    fn query_array(&self, root: &serde_json::Value, path: &Option<String>) -> Option<Vec<String>> {
        let path = path.as_ref()?;
        let compiled = JsonPath::parse(path).ok()?;
        let nodes = compiled.query(root);
        Some(
            nodes
                .iter()
                .map(|n| match n {
                    serde_json::Value::String(s) => s.clone(),
                    serde_json::Value::Null => String::new(),
                    other => other.to_string(),
                })
                .collect(),
        )
    }

    fn as_array(value: serde_json::Value) -> Vec<serde_json::Value> {
        match value {
            serde_json::Value::Array(arr) => arr,
            serde_json::Value::Null => Vec::new(),
            other => vec![other],
        }
    }
}

impl TestParser for GenericParser {
    fn parse(&self, file_path: &Path) -> Result<Vec<TestSuite>, String> {
        let content = fs::read_to_string(file_path).map_err(|e| format!("I/O error: {}", e))?;
        let root: serde_json::Value =
            serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;
        let suites = self.parse_value(&root)?;
        eprintln!(
            "Parsed {} suite(s) from {}",
            suites.len(),
            file_path.display()
        );
        Ok(suites)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn mapping_json() -> &'static str {
        r#"{
            "version": 1,
            "timeUnit": "s",
            "suitePath": "$.testResults[*]",
            "suiteName": "$.name",
            "suiteFile": "$.name",
            "suiteTimestamp": "$.timestamp",
            "suiteDuration": "$.time",
            "testPath": "$.assertionResults[*]",
            "testName": "$.title",
            "testStatus": "$.status",
            "testTime": "$.duration",
            "testMessage": "$.failureMessages[0]",
            "testAncestorTitles": "$.ancestorTitles[*]",
            "statusMap": {
                "passed": "passed",
                "failed": "failed",
                "skipped": "skipped",
                "pending": "skipped"
            }
        }"#
    }

    fn source_json() -> &'static str {
        r#"{
            "testResults": [
                {
                    "name": "src/example.test.js",
                    "timestamp": "2024-01-01T00:00:00Z",
                    "time": 0.5,
                    "assertionResults": [
                        {
                            "title": "adds 1 + 2",
                            "status": "passed",
                            "duration": 5,
                            "ancestorTitles": ["Math"],
                            "failureMessages": []
                        },
                        {
                            "title": "fails",
                            "status": "failed",
                            "duration": 12,
                            "ancestorTitles": ["Math"],
                            "failureMessages": ["Expected 3 to equal 4"]
                        },
                        {
                            "title": "skipped one",
                            "status": "pending",
                            "duration": 0,
                            "ancestorTitles": [],
                            "failureMessages": []
                        }
                    ]
                }
            ]
        }"#
    }

    fn create_temp_json_file(content: &str) -> NamedTempFile {
        let mut file = NamedTempFile::new().expect("Failed to create temp file");
        file.write_all(content.as_bytes())
            .expect("Failed to write to temp file");
        file
    }

    #[test]
    fn parse_valid_json_source() {
        let parser = GenericParser::from_mapping_str(mapping_json()).unwrap();
        let file = create_temp_json_file(source_json());
        let result = parser.parse(file.path()).unwrap();

        assert_eq!(result.len(), 1);
        let suite = &result[0];
        assert_eq!(suite.name, "src/example.test.js");
        assert_eq!(suite.file.as_deref(), Some("src/example.test.js"));
        assert_eq!(suite.timestamp, "2024-01-01T00:00:00Z");
        assert_eq!(suite.duration, 0.5);
        assert_eq!(suite.tests.len(), 3);

        assert_eq!(suite.tests[0].name, "adds 1 + 2");
        assert_eq!(suite.tests[0].status, TestStatus::Passed);
        assert_eq!(suite.tests[0].ancestor_titles, vec!["Math".to_string()]);

        assert_eq!(suite.tests[1].name, "fails");
        assert_eq!(suite.tests[1].status, TestStatus::Failed("Expected 3 to equal 4".to_string()));

        assert_eq!(suite.tests[2].name, "skipped one");
        assert_eq!(suite.tests[2].status, TestStatus::Skipped(String::new()));
    }

    #[test]
    fn time_unit_ms_converts_to_seconds() {
        let mut mapping = serde_json::from_str::<serde_json::Value>(mapping_json()).unwrap();
        mapping["timeUnit"] = serde_json::json!("ms");
        let parser = GenericParser::from_mapping_str(&mapping.to_string()).unwrap();
        let file = create_temp_json_file(source_json());
        let result = parser.parse(file.path()).unwrap();

        // duration 5 ms -> 0.005 s
        assert!((result[0].tests[0].time - 0.005).abs() < 1e-9);
    }

    #[test]
    fn unknown_status_returns_error() {
        let parser = GenericParser::from_mapping_str(mapping_json()).unwrap();
        let bad_source = r#"{
            "testResults": [{
                "name": "s",
                "assertionResults": [{ "title": "t", "status": "bogus" }]
            }]
        }"#;
        let file = create_temp_json_file(bad_source);
        let result = parser.parse(file.path());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("bogus"));
    }

    #[test]
    fn single_suite_object_is_wrapped() {
        let mapping = r#"{
            "version": 1,
            "suitePath": "$.suite",
            "suiteName": "$.name",
            "testPath": "$.tests[*]",
            "testName": "$.n",
            "testStatus": "$.s",
            "statusMap": { "ok": "passed" }
        }"#;
        let source = r#"{
            "suite": {
                "name": "only",
                "tests": [ { "n": "t1", "s": "ok" } ]
            }
        }"#;
        let parser = GenericParser::from_mapping_str(mapping).unwrap();
        let file = create_temp_json_file(source);
        let result = parser.parse(file.path()).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].name, "only");
        assert_eq!(result[0].tests.len(), 1);
        assert_eq!(result[0].tests[0].status, TestStatus::Passed);
    }

    #[test]
    fn empty_source_yields_empty_no_error() {
        let parser = GenericParser::from_mapping_str(mapping_json()).unwrap();
        let file = create_temp_json_file(r#"{ "testResults": [] }"#);
        let result = parser.parse(file.path()).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn optional_fields_absent_use_defaults() {
        let mapping = r#"{
            "version": 1,
            "suitePath": "$.suites[*]",
            "testPath": "$.cases[*]",
            "testName": "$.name",
            "testStatus": "$.status",
            "statusMap": { "passed": "passed" }
        }"#;
        let source = r#"{
            "suites": [{
                "cases": [{ "name": "t", "status": "passed" }]
            }]
        }"#;
        let parser = GenericParser::from_mapping_str(mapping).unwrap();
        let file = create_temp_json_file(source);
        let result = parser.parse(file.path()).unwrap();
        let suite = &result[0];
        assert_eq!(suite.name, "");
        assert_eq!(suite.file, None);
        assert_eq!(suite.timestamp, "");
        assert_eq!(suite.duration, 0.0);
        assert_eq!(suite.tests[0].time, 0.0);
        assert_eq!(suite.tests[0].ancestor_titles, Vec::<String>::new());
    }

    #[test]
    fn invalid_selector_syntax_errors_at_parse() {
        let mapping = r#"{
            "version": 1,
            "suitePath": "$$.bad[",
            "testPath": "$.t[*]",
            "testName": "$.n",
            "testStatus": "$.s",
            "statusMap": { "passed": "passed" }
        }"#;
        let parser = GenericParser::from_mapping_str(mapping).unwrap();
        let file = create_temp_json_file(r#"{}"#);
        let result = parser.parse(file.path());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid path"));
    }
}
