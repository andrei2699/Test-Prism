use serde::Deserialize;

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
}
