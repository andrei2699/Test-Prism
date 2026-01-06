use assert_json_diff::assert_json_eq;
use parameterized::parameterized;
use parser::commands::parse_command::parse_command;
use std::fs;
use serde_json::Value;
use tempfile::tempdir;

#[parameterized(input_file = {
    "tests/data/junit/input/TEST-com.testprism.SuccessTest.xml"
}, expected_output_file = {
    "tests/data/junit/output/TEST-com.testprism.SuccessTest.json"
})]
fn junit_parse_command(input_file: &str, expected_output_file: &str) {
    let temp_dir = tempdir().expect("Failed to create temp dir");
    let output_path = temp_dir.path().join("output.json");
    let output_path_str = output_path.to_str().unwrap().to_string();

    parse_command(
        "junit".to_string(),
        input_file.to_string(),
        output_path_str.to_string(),
        "2025-01-06T15:34:21.123Z".to_string(),
    );

    let actual_content = fs::read_to_string(output_path).expect("Failed to read output file");
    let expected_content =
        fs::read_to_string(expected_output_file).expect("Failed to read expected output file");

    let actual_json: Value = serde_json::from_str(&actual_content).expect("Failed to parse actual JSON");
    let expected_json: Value = serde_json::from_str(&expected_content).expect("Failed to parse expected JSON");
    assert_json_eq!(actual_json, expected_json);
}
