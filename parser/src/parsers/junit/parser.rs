use crate::test::TestParser;
use crate::test_models::TestSuite;
use quick_xml::events::Event;
use quick_xml::reader::Reader;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;

pub struct JunitParser;

impl TestParser for JunitParser {
    fn parse(&self, file_path: &Path) -> Result<Vec<TestSuite>, String> {
        let reader = Reader::from_file(file_path);

        match reader {
            Ok(reader) => self.parse_from_reader(reader),
            Err(error) => Err(error.to_string()),
        }
    }
}

impl JunitParser {
    fn parse_from_reader(
        &self,
        mut reader: Reader<BufReader<File>>,
    ) -> Result<Vec<TestSuite>, String> {
        let mut buf = Vec::new();
        let tests: Vec<TestSuite> = Vec::new();

        loop {
            match reader.read_event_into(&mut buf) {
                Err(e) => {
                    return Err(e.to_string());
                }
                Ok(Event::Eof) => break,

                // Ok(Event::Start(e)) => match e.name().as_ref() {
                //     b"tag1" => println!(
                //         "attributes values: {:?}",
                //         e.attributes().map(|a| a.unwrap().value).collect::<Vec<_>>()
                //     ),
                //     b"tag2" => count += 1,
                //     _ => (),
                // },
                // Ok(Event::Text(e)) => txt.push(e.decode().unwrap().into_owned()),
                //
                // // There are several other `Event`s we do not consider here
                _ => todo!(),
            };

            buf.clear();
        }
        Ok(tests)
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
                .contains("I/O error: The system cannot find the file specified. (os error 2)")
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

    // #[test]
    // fn empty_test_suite() {
    //     let xml_content = r#"
    //         <testsuite name="MyTestSuite" tests="2" failures="0" errors="0" skipped="0" time="0.123" timestamp="2023-10-27T10:00:00Z">
    //             <testcase name="test_success_1" classname="com.example.MyClass" time="0.05"></testcase>
    //             <testcase name="test_success_2" classname="com.example.MyClass" time="0.07"/>
    //         </testsuite>
    //     "#;
    //     let path = create_temp_xml_file(xml_content);
    //     let parser = JunitParser;
    //     let result = parser.parse(&path);
    //
    //     assert!(result.is_ok());
    //     let tests = result.unwrap();
    //     assert_eq!(tests.len(), 1);
    //     let suite = &tests[0];
    //     assert_eq!(suite.name, "MyTestSuite");
    //     assert_eq!(suite.duration, 0.123);
    //     assert_eq!(suite.timestamp, "2023-10-27T10:00:00Z");
    //     assert_eq!(suite.methods.len(), 2);
    //
    //     assert_eq!(suite.methods[0].name, "test_success_1");
    //     assert_eq!(suite.methods[0].classname, "com.example.MyClass");
    //     assert_eq!(suite.methods[0].time, 0.05);
    //     assert_eq!(suite.methods[0].status, TestStatus::Passed);
    //
    //     assert_eq!(suite.methods[1].name, "test_success_2");
    //     assert_eq!(suite.methods[1].classname, "com.example.MyClass");
    //     assert_eq!(suite.methods[1].time, 0.07);
    //     assert_eq!(suite.methods[1].status, TestStatus::Passed);
    // }
}
