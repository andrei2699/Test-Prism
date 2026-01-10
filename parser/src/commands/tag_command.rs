use crate::test_report::{TestReport, TestReportTest};
use std::fs;

pub fn tag_command(input: String, output: Option<String>, tags: Vec<String>) {
    let mut report = read_report(&input);
    let tag_expressions = parse_tag_expressions(tags);
    apply_tags(&mut report, &tag_expressions);
    let output_path = output.unwrap_or(input);
    write_report(&report, &output_path);
}

fn read_report(input_path: &str) -> TestReport {
    let data = fs::read_to_string(input_path).expect("Failed to read input file");
    serde_json::from_str(&data).expect("Failed to parse input file")
}

fn parse_tag_expressions(tags: Vec<String>) -> Vec<(String, Vec<String>)> {
    tags.into_iter()
        .map(|tag| {
            let mut parts = tag.splitn(2, ':');
            let expression = parts.next().unwrap_or("").to_string();
            let tags = parts
                .next()
                .unwrap_or("")
                .split(',')
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty())
                .collect();
            (expression, tags)
        })
        .collect()
}

fn apply_tags(report: &mut TestReport, tag_expressions: &[(String, Vec<String>)]) {
    for test in &mut report.tests {
        for (expression, tags) in tag_expressions {
            if test.path.contains(expression) {
                add_tags_to_test(test, tags);
            }
        }
    }
}

fn add_tags_to_test(test: &mut TestReportTest, tags_to_add: &[String]) {
    let mut current_tags = test.tags.clone().unwrap_or_default();
    for tag in tags_to_add {
        if !current_tags.contains(tag) {
            current_tags.push(tag.clone());
        }
    }
    test.tags = Some(current_tags);
}

fn write_report(report: &TestReport, output_path: &str) {
    let json = serde_json::to_string_pretty(report).expect("Failed to serialize report");
    fs::write(output_path, json).expect("Failed to write report");
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_report::{TestReport, TestReportStatus};
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn create_test_report() -> TestReport {
        TestReport {
            version: 1,
            date: "2024-01-01T00:00:00Z".to_string(),
            tests: vec![
                TestReportTest {
                    last_execution_type: TestReportStatus::Success,
                    name: "test1".to_string(),
                    path: "path/to/test1".to_string(),
                    duration_ms: 100,
                    message: None,
                    tags: None,
                },
                TestReportTest {
                    last_execution_type: TestReportStatus::Failure,
                    name: "test2".to_string(),
                    path: "path/to/test2".to_string(),
                    duration_ms: 200,
                    message: Some("failed".to_string()),
                    tags: Some(vec!["existing_tag".to_string()]),
                },
            ],
        }
    }

    #[test]
    fn when_adding_tags_to_a_test_that_has_no_tags_it_should_add_the_new_tags() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["test1:tag1,tag2".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["tag1".to_string(), "tag2".to_string()])
        );
    }

    #[test]
    fn when_adding_tags_to_a_test_that_has_existing_tags_it_should_append_the_new_tags() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["test2:tag3".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["existing_tag".to_string(), "tag3".to_string()])
        );
    }

    #[test]
    fn when_adding_an_existing_tag_to_a_test_it_should_not_add_a_duplicate() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["test2:existing_tag".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["existing_tag".to_string()])
        );
    }

    #[test]
    fn when_using_a_general_expression_it_should_add_tags_to_all_matching_tests() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["path/to:tag1,tag2".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["tag1".to_string(), "tag2".to_string()])
        );
        assert_eq!(
            result_report.tests[1].tags,
            Some(vec![
                "existing_tag".to_string(),
                "tag1".to_string(),
                "tag2".to_string()
            ])
        );
    }

    #[test]
    fn when_multiple_expressions_match_a_test_it_should_add_all_tags() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["path/to:tag1".to_string(), "test2:tag3".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[1].tags,
            Some(vec![
                "existing_tag".to_string(),
                "tag1".to_string(),
                "tag3".to_string()
            ])
        );
    }

    #[test]
    fn when_expression_does_not_match_any_test_it_should_not_add_tags() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["non_matching_expression:tag1".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(result_report.tests[0].tags, None);
        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["existing_tag".to_string()])
        );
    }

    #[test]
    fn when_tag_string_is_empty_it_should_not_add_tags() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            vec!["test1:".to_string()],
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(result_report.tests[0].tags, Some(vec![]));
    }

    #[test]
    fn when_no_output_file_is_provided_it_should_overwrite_the_input_file() {
        let report = create_test_report();
        let mut input_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            None,
            vec!["test1:tag1".to_string()],
        );

        let result_data = fs::read_to_string(input_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["tag1".to_string()])
        );
    }
}
