use crate::parsers::junit::JunitParser;
use crate::test_parser::TestParser;
use crate::test_report::{TestReport, TestReportStatus, TestReportTest};
use std::path::Path;

pub fn parse_command(report_type: String, input: String, output: String, current_date: String) {
    let input_path = Path::new(&input);

    let parser = get_parser(&report_type);

    let path = Path::new(&input_path);
    match parser.parse(path) {
        Ok(tests) => {
            let test_report_tests: Vec<TestReportTest> = tests
                .iter()
                .flat_map(|suite| {
                    suite.tests.iter().map(move |test| TestReportTest {
                        last_execution_type: TestReportStatus::from_test_status(
                            test.status.clone(),
                        ),
                        name: test.name.clone(),
                        path: suite.name.clone(),
                        duration_ms: (test.time * 1000.0) as u64,
                        message: TestReportTest::message_from_test_status(test.status.clone()),
                    })
                })
                .collect();

            let test_report = TestReport {
                version: 1,
                date: current_date.to_string(),
                tests: test_report_tests,
            };

            write_test_report(&test_report, &output);
        }
        Err(e) => println!("Error parsing file: {}", e),
    }
}

fn get_parser(report_type: &str) -> impl TestParser {
    match report_type {
        "junit" => JunitParser,
        _ => panic!(
            "Unknown report_type: {}. Supported types: junit",
            report_type
        ),
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

    #[test]
    fn panic_if_unsupported_report_type() {
        let report_type = "unsupported";

        let result = std::panic::catch_unwind(|| get_parser(report_type));

        assert!(result.is_err());
    }
}
