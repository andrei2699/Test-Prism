use serde::Deserialize;

#[derive(Debug, PartialEq, Deserialize)]
pub enum JunitRoot {
    #[serde(rename = "testsuites")]
    TestSuites(JunitTestSuites),
    #[serde(rename = "testsuite")]
    TestSuite(JunitTestSuite),
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
pub struct JunitTestSuites {
    #[serde(rename = "testsuite", default)]
    pub test_suites: Vec<JunitTestSuite>,
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
pub struct JunitTestSuite {
    #[serde(rename = "@name")]
    pub name: String,
    #[serde(rename = "@tests")]
    pub tests: u64,
    #[serde(rename = "@failures")]
    pub failures: u64,
    #[serde(rename = "@errors")]
    pub errors: u64,
    #[serde(rename = "@skipped")]
    pub skipped: u64,
    #[serde(rename = "@time")]
    pub time: f64,
    #[serde(rename = "@timestamp")]
    pub timestamp: String,

    #[serde(rename = "testcase", default)]
    pub test_cases: Vec<JunitTestCase>,
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
pub struct JunitTestCase {
    #[serde(rename = "@name")]
    pub name: String,
    #[serde(rename = "@classname")]
    pub classname: String,
    #[serde(rename = "@time")]
    pub time: f64,
    #[serde(rename = "failure", default)]
    pub failure: Option<JunitFailure>,
    #[serde(rename = "error", default)]
    pub error: Option<JunitError>,
    #[serde(rename = "skipped", default)]
    pub skipped: Option<JunitSkipped>,
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
pub struct JunitFailure {
    #[serde(rename = "@message")]
    pub message: String,
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
pub struct JunitError {
    #[serde(rename = "@message")]
    pub message: String,
}

#[derive(Debug, PartialEq, Default, Deserialize)]
#[serde(default)]
pub struct JunitSkipped {
    #[serde(rename = "@message")]
    pub message: String,
}
