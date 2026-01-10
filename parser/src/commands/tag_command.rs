use crate::test_report::TestReport;
use regex::Regex;
use std::fs;

enum TagOperation {
    Add,
    Remove,
    Update,
}

struct ParsedExpression {
    expression: Regex,
    operation: TagOperation,
    tags: Vec<String>,
}

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

fn parse_tag_expressions(tags: Vec<String>) -> Vec<ParsedExpression> {
    tags.into_iter()
        .filter_map(|tag| {
            let parts: Vec<&str> = tag.splitn(3, ':').collect();
            if parts.len() != 3 {
                return None;
            }

            let expression = parts[0].to_string();
            if expression.is_empty() {
                return None;
            }

            let operation = match parts[1] {
                "add" => TagOperation::Add,
                "remove" => TagOperation::Remove,
                "update" => TagOperation::Update,
                _ => return None,
            };

            let tags_str = parts[2];
            if tags_str.is_empty()
                && (matches!(operation, TagOperation::Add)
                    || matches!(operation, TagOperation::Remove))
            {
                return None;
            }

            let tags = tags_str
                .split(',')
                .map(|s| s.to_string())
                .filter(|s| !s.is_empty())
                .collect();

            Regex::new(&expression).ok().map(|re| ParsedExpression {
                expression: re,
                operation,
                tags,
            })
        })
        .collect()
}

fn apply_tags(report: &mut TestReport, tag_expressions: &[ParsedExpression]) {
    for test in &mut report.tests {
        for parsed_expression in tag_expressions {
            let ParsedExpression {
                expression,
                operation,
                tags,
            } = parsed_expression;

            if expression.is_match(&test.path) {
                test.tags = match operation {
                    TagOperation::Add => add_tags_to_test(test.tags.as_ref(), tags),
                    TagOperation::Remove => remove_tags_from_test(test.tags.as_ref(), tags),
                    TagOperation::Update => update_tags_in_test(tags),
                };
            }
        }
    }
}

fn add_tags_to_test(
    current_tags: Option<&Vec<String>>,
    tags_to_add: &[String],
) -> Option<Vec<String>> {
    let mut new_tags = current_tags.cloned().unwrap_or_default();
    for tag in tags_to_add {
        if !new_tags.contains(tag) {
            new_tags.push(tag.clone());
        }
    }
    Some(new_tags)
}

fn remove_tags_from_test(
    current_tags: Option<&Vec<String>>,
    tags_to_remove: &[String],
) -> Option<Vec<String>> {
    current_tags.map(|tags| {
        tags.iter()
            .filter(|tag| !tags_to_remove.contains(tag))
            .cloned()
            .collect()
    })
}

fn update_tags_in_test(tags_to_update: &[String]) -> Option<Vec<String>> {
    Some(tags_to_update.to_vec())
}

fn write_report(report: &TestReport, output_path: &str) {
    let json = serde_json::to_string_pretty(report).expect("Failed to serialize report");
    fs::write(output_path, json).expect("Failed to write report");
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_report::{TestReport, TestReportStatus, TestReportTest};
    use parameterized::parameterized;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn add_tags_to_test_without_tags() {
        let report = create_test_report(vec![create_test_without_tags("test1", "path/to/test1")]);
        let (_, _, result_report) = setup_test(&report, vec!["test1:add:tag1,tag2".to_string()]);

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["tag1".to_string(), "tag2".to_string()])
        );
    }

    #[test]
    fn add_tags_to_test_with_existing_tags() {
        let report = create_test_report(vec![create_test_with_tags(
            "test2",
            "path/to/test2",
            vec!["existing_tag", "another_tag"],
        )]);
        let (_, _, result_report) = setup_test(&report, vec!["test2:add:tag3".to_string()]);

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec![
                "existing_tag".to_string(),
                "another_tag".to_string(),
                "tag3".to_string()
            ])
        );
    }

    #[test]
    fn add_existing_tag_does_not_duplicate() {
        let report = create_test_report(vec![create_test_with_tags(
            "test2",
            "path/to/test2",
            vec!["existing_tag", "another_tag"],
        )]);
        let (_, _, result_report) = setup_test(&report, vec!["test2:add:existing_tag".to_string()]);

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["existing_tag".to_string(), "another_tag".to_string()])
        );
    }

    #[test]
    fn remove_existing_tag() {
        let report = create_test_report(vec![create_test_with_tags(
            "test2",
            "path/to/test2",
            vec!["existing_tag", "another_tag"],
        )]);
        let (_, _, result_report) =
            setup_test(&report, vec!["test2:remove:existing_tag".to_string()]);

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["another_tag".to_string()])
        );
    }

    #[test]
    fn remove_non_existing_tag() {
        let report = create_test_report(vec![create_test_with_tags(
            "test2",
            "path/to/test2",
            vec!["existing_tag", "another_tag"],
        )]);
        let (_, _, result_report) =
            setup_test(&report, vec!["test2:remove:non_existing_tag".to_string()]);

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["existing_tag".to_string(), "another_tag".to_string()])
        );
    }

    #[test]
    fn update_tags_replaces_existing_tags() {
        let report = create_test_report(vec![create_test_with_tags(
            "test2",
            "path/to/test2",
            vec!["existing_tag", "another_tag"],
        )]);
        let (_, _, result_report) =
            setup_test(&report, vec!["test2:update:new_tag1,new_tag2".to_string()]);

        assert_eq!(
            result_report.tests[0].tags,
            Some(vec!["new_tag1".to_string(), "new_tag2".to_string()])
        );
    }

    #[test]
    fn multiple_expressions_are_applied_correctly() {
        let report = create_test_report(vec![
            create_test_without_tags("test1", "path/to/test1"),
            create_test_with_tags(
                "test2",
                "path/to/test2",
                vec!["existing_tag", "another_tag"],
            ),
        ]);
        let (_, _, result_report) = setup_test(
            &report,
            vec![
                "test1:add:tag1".to_string(),
                "test2:remove:existing_tag".to_string(),
                "test2:add:tag2".to_string(),
            ],
        );

        assert_eq!(result_report.tests[0].tags, Some(vec!["tag1".to_string()]));
        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["another_tag".to_string(), "tag2".to_string()])
        );
    }

    #[parameterized(
        expression = {
            "invalid_expression",
            "test1:invalid_op:tag1",
            "test1:add:",
            ":add:tag1",
            "::",
        }
    )]
    fn invalid_expression_is_ignored(expression: &str) {
        let report = create_test_report(vec![
            create_test_without_tags("test1", "path/to/test1"),
            create_test_with_tags(
                "test2",
                "path/to/test2",
                vec!["existing_tag", "another_tag"],
            ),
        ]);
        let (_, _, result_report) = setup_test(&report, vec![expression.to_string()]);

        assert_eq!(result_report.tests[0].tags, None);
        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["existing_tag".to_string(), "another_tag".to_string()])
        );
    }

    #[test]
    fn regex_expression_is_applied_correctly() {
        let report = create_test_report(vec![
            create_test_without_tags("test1", "path/to/test1"),
            create_test_with_tags("test2", "path/to/another/test2", vec!["existing_tag"]),
        ]);
        let (_, _, result_report) = setup_test(&report, vec!["path/to/.*:add:smoke".to_string()]);

        assert_eq!(result_report.tests[0].tags, Some(vec!["smoke".to_string()]));
        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["existing_tag".to_string(), "smoke".to_string()])
        );
    }

    #[test]
    fn regex_match_all_expression_is_applied_correctly() {
        let report = create_test_report(vec![
            create_test_without_tags("test1", "path/to/test1"),
            create_test_with_tags("test2", "path/to/another/test2", vec!["existing_tag"]),
        ]);
        let (_, _, result_report) = setup_test(&report, vec![".*:add:smoke".to_string()]);

        assert_eq!(result_report.tests[0].tags, Some(vec!["smoke".to_string()]));
        assert_eq!(
            result_report.tests[1].tags,
            Some(vec!["existing_tag".to_string(), "smoke".to_string()])
        );
    }

    #[test]
    fn no_output_file_overwrites_input_file() {
        let report = create_test_report(vec![create_test_without_tags("test1", "path/to/test1")]);
        let mut input_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            None,
            vec!["test1:add:tag1".to_string()],
        );

        let result_data = fs::read_to_string(input_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        assert_eq!(result_report.tests[0].tags, Some(vec!["tag1".to_string()]));
    }

    fn setup_test(
        report: &TestReport,
        tags: Vec<String>,
    ) -> (NamedTempFile, NamedTempFile, TestReport) {
        let mut input_file = NamedTempFile::new().unwrap();
        let output_file = NamedTempFile::new().unwrap();
        let json = serde_json::to_string(report).unwrap();
        input_file.write_all(json.as_bytes()).unwrap();

        tag_command(
            input_file.path().to_str().unwrap().to_string(),
            Some(output_file.path().to_str().unwrap().to_string()),
            tags,
        );

        let result_data = fs::read_to_string(output_file.path()).unwrap();
        let result_report: TestReport = serde_json::from_str(&result_data).unwrap();

        (input_file, output_file, result_report)
    }

    fn create_test_report(tests: Vec<TestReportTest>) -> TestReport {
        TestReport {
            version: 1,
            date: "2024-01-01T00:00:00Z".to_string(),
            tests,
        }
    }

    fn create_test_without_tags(name: &str, path: &str) -> TestReportTest {
        TestReportTest {
            last_execution_type: TestReportStatus::Success,
            name: name.to_string(),
            path: path.to_string(),
            duration_ms: 100,
            message: None,
            tags: None,
        }
    }

    fn create_test_with_tags(name: &str, path: &str, tags: Vec<&str>) -> TestReportTest {
        TestReportTest {
            last_execution_type: TestReportStatus::Failure,
            name: name.to_string(),
            path: path.to_string(),
            duration_ms: 200,
            message: Some("failed".to_string()),
            tags: Some(tags.into_iter().map(|s| s.to_string()).collect()),
        }
    }
}
