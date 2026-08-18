use crate::parsers::generic::GenericParser;
use crate::parsers::jest::JestParser;
use crate::parsers::junit::JunitParser;
use crate::parsers::vitest::VitestParser;
use crate::test_parser::TestParser;
use crate::test_report::{TestExecution, TestExecutionStatus, TestReport, TestReportTest};
use std::path::Path;

pub fn parse_command(
    report_type: String,
    input: String,
    output: String,
    current_date: String,
    tags: Vec<String>,
    mapping: Option<String>,
) {
    let parser = match get_parser(&report_type, mapping.as_deref()) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("{}", e);
            std::process::exit(1);
        }
    };

    if is_generic_type(&report_type) && Path::new(&input).is_dir() {
        eprintln!("Error: generic report types (json/xml) require a single input file, not a directory");
        std::process::exit(1);
    }

    let input_paths = extract_folder_path_first_level(&input);

    let mut all_test_report_tests: Vec<TestReportTest> = Vec::new();

    for path_string in input_paths {
        let path = Path::new(&path_string);
        let tests = parse_file(parser.as_ref(), &path_string, path, &tags, &current_date);

        all_test_report_tests.extend(tests);
    }

    let test_report = TestReport {
        version: 2,
        timestamp: current_date.to_string(),
        tests: all_test_report_tests,
    };

    write_test_report(&test_report, &output);
}

fn parse_file(
    parser: &dyn TestParser,
    path_str: &str,
    path: &Path,
    tags: &[String],
    timestamp: &str,
) -> Vec<TestReportTest> {
    match parser.parse(path) {
        Ok(tests) => tests
            .iter()
            .flat_map(|suite| {
                suite.tests.iter().map(move |test| {
                    let execution = TestExecution {
                        timestamp: if suite.timestamp.is_empty() {
                            timestamp.to_string()
                        } else {
                            suite.timestamp.clone()
                        },
                        status: TestExecutionStatus::from_test_status(&test.status),
                        duration_ms: (test.time * 1000.0) as u64,
                        message: TestExecution::message_from_test_status(&test.status),
                        console_output: test.console_output.clone(),
                    };

                    let mut logical_path: Vec<String> = if suite.name.is_empty() {
                        Vec::new()
                    } else {
                        suite.name.split('$').map(|s| s.to_string()).collect()
                    };
                    logical_path.extend(test.ancestor_titles.clone());

                    TestReportTest {
                        name: test.name.clone(),
                        file: suite.file.clone(),
                        path: logical_path,
                        executions: vec![execution],
                        tags: if tags.is_empty() {
                            None
                        } else {
                            Some(tags.to_vec())
                        },
                    }
                })
            })
            .collect(),
        Err(e) => {
            eprintln!("Error parsing file {}: {}", path_str, e);
            vec![]
        }
    }
}

fn get_parser(report_type: &str, mapping: Option<&str>) -> Result<Box<dyn TestParser>, String> {
    match report_type {
        "junit" => Ok(Box::new(JunitParser)),
        "jest" => Ok(Box::new(JestParser)),
        "vitest" => Ok(Box::new(VitestParser)),
        "json" | "xml" => {
            let mapping_path = mapping.ok_or_else(|| {
                "Error: --mapping is required for generic report types (json/xml)".to_string()
            })?;
            Ok(Box::new(GenericParser::from_mapping_file(Path::new(mapping_path))?))
        }
        _ => Err(format!(
            "Unknown report_type: {}. Supported types: junit, jest, vitest, json, xml",
            report_type
        )),
    }
}

fn is_generic_type(report_type: &str) -> bool {
    report_type == "json" || report_type == "xml"
}

fn extract_folder_path_first_level(file_path: &str) -> Vec<String> {
    let path = Path::new(file_path);

    if path.is_dir() {
        let mut paths: Vec<String> = path
            .read_dir()
            .unwrap()
            .filter_map(|entry| {
                let entry = entry.unwrap();
                let entry_path = entry.path();
                if entry_path.is_file() {
                    Some(entry_path.to_str().unwrap().to_string())
                } else {
                    None
                }
            })
            .collect();
        paths.sort();
        paths
    } else {
        vec![file_path.to_string()]
    }
}

fn write_test_report(test_report: &TestReport, output_path: &str) {
    let output_path = Path::new(output_path);
    let file = std::fs::File::create(output_path).expect("Failed to create output file");
    let writer = std::io::BufWriter::new(file);

    serde_json::to_writer(writer, test_report).expect("Failed to write to output file");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::fs::File;
    use std::io::Write;
    use tempfile::{tempdir, NamedTempFile};

    #[test]
    fn panic_if_unsupported_report_type() {
        let report_type = "unsupported";

        let result = get_parser(report_type, None);

        assert!(result.is_err());
    }

    #[test]
    fn given_file_path_when_path_is_file_return_list_with_one_element() {
        let file = NamedTempFile::new().expect("Failed to create temp file");
        let file_path = file.path().to_str().unwrap().to_string();

        let result = extract_folder_path_first_level(&file_path);

        assert_eq!(result.len(), 1);
        assert_eq!(result[0], file_path);
    }

    #[test]
    fn given_file_path_when_path_is_folder_return_list_with_the_file_paths_from_the_folder() {
        let dir = tempdir().expect("Failed to create temp dir");
        let file1_path = dir.path().join("file1.xml");
        let file2_path = dir.path().join("file2.xml");
        File::create(&file1_path).expect("Failed to create file1");
        File::create(&file2_path).expect("Failed to create file2");

        let folder_path = dir.path().to_str().unwrap();
        let result = extract_folder_path_first_level(folder_path);

        assert_eq!(result.len(), 2);
        assert!(result.contains(&file1_path.to_str().unwrap().to_string()));
        assert!(result.contains(&file2_path.to_str().unwrap().to_string()));
    }

    #[test]
    fn when_parsing_a_file_with_tags_it_should_add_the_tags_to_all_tests() {
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let xml_content = r#"
            <testsuite name="suite1" tests="1" failures="0" errors="0" skipped="0" timestamp="2024-01-01T00:00:00Z" time="1.0">
                <testcase name="test1" classname="class1" time="1.0" />
            </testsuite>
        "#;
        input_file.write_all(xml_content.as_bytes()).unwrap();

        parse_command(
            "junit".to_string(),
            input_file.path().to_str().unwrap().to_string(),
            output_file.path().to_str().unwrap().to_string(),
            "2024-01-01T00:00:00Z".to_string(),
            vec!["tag1".to_string(), "tag2".to_string()],
            None,
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["tag1".to_string(), "tag2".to_string()])
        );
    }

    #[test]
    fn when_parsing_a_file_without_tags_it_should_not_add_any_tags() {
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let xml_content = r#"
            <testsuite name="suite1" tests="1" failures="0" errors="0" skipped="0" timestamp="2024-01-01T00:00:00Z" time="1.0">
                <testcase name="test1" classname="class1" time="1.0" />
            </testsuite>
        "#;
        input_file.write_all(xml_content.as_bytes()).unwrap();

        parse_command(
            "junit".to_string(),
            input_file.path().to_str().unwrap().to_string(),
            output_file.path().to_str().unwrap().to_string(),
            "2024-01-01T00:00:00Z".to_string(),
            vec![],
            None,
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(result_report.tests[0].tags, None);
    }

    #[test]
    fn generic_report_type_without_mapping_returns_error() {
        let result = get_parser("json", None);
        assert!(result.is_err());
        assert!(result.err().unwrap().contains("--mapping"));
    }

    #[test]
    fn generic_report_type_with_invalid_mapping_returns_error() {
        let mut mapping_file = NamedTempFile::new().unwrap();
        mapping_file
            .write_all(
                br#"{
                    "version": 2,
                    "suitePath": "$.s",
                    "testPath": "$.t",
                    "testName": "$.n",
                    "testStatus": "$.st",
                    "statusMap": { "ok": "passed" }
                }"#,
            )
            .unwrap();

        let result = get_parser("json", Some(mapping_file.path().to_str().unwrap()));
        assert!(result.is_err());
        assert!(result.err().unwrap().contains("version"));
    }

    #[test]
    fn generic_report_type_with_valid_mapping_parses_json_source() {
        let mut mapping_file = NamedTempFile::new().unwrap();
        mapping_file.write_all(
            br#"{
                "version": 1,
                "suitePath": "$.suites[*]",
                "suiteName": "$.name",
                "testPath": "$.cases[*]",
                "testName": "$.n",
                "testStatus": "$.s",
                "statusMap": { "ok": "passed", "bad": "failed" }
            }"#,
        ).unwrap();

        let mut input_file = NamedTempFile::new().unwrap();
        input_file.write_all(
            br#"{
                "suites": [{
                    "name": "suite1",
                    "cases": [
                        { "n": "test1", "s": "ok" },
                        { "n": "test2", "s": "bad" }
                    ]
                }]
            }"#,
        ).unwrap();

        let output_file = NamedTempFile::new().unwrap();
        parse_command(
            "json".to_string(),
            input_file.path().to_str().unwrap().to_string(),
            output_file.path().to_str().unwrap().to_string(),
            "2024-01-01T00:00:00Z".to_string(),
            vec![],
            Some(mapping_file.path().to_str().unwrap().to_string()),
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();
        assert_eq!(result_report.tests.len(), 2);
        assert_eq!(result_report.tests[0].name, "test1");
        assert_eq!(result_report.tests[1].name, "test2");
    }
}
