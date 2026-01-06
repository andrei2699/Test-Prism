use crate::parsers::junit::JunitParser;
use crate::test::TestParser;
use std::path::Path;

pub fn parse_command(report_type: String, input: String, output: Option<String>) {
    let input_path = Path::new(&input);

    let parser = get_parser(&*report_type);

    let path = Path::new(&input_path);
    match parser.parse(path) {
        Ok(tests) => {
            println!("Parsed {} tests.", tests.len());
            for test in tests {
                println!("Test Suite: {}", test.name);
                for method in test.tests {
                    println!("  Method: {} - {:?}", method.name, method.status);
                }
            }
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
