use serde::Deserialize;

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
struct JunitTestSuite {
    name: String,
    tests: u64,
    failures: u64,
    errors: u64,
    skipped: u64,
    time: f64,
    timestamp: String,
    #[serde(rename = "testcase")]
    test_cases: Vec<JunitTestCase>,
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
struct JunitTestCase {
    name: String,
    classname: String,
    time: f64,
}
