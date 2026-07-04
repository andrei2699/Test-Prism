use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct JestReport {
    #[serde(rename = "testResults")]
    pub test_results: Vec<JestTestResult>,
}

#[derive(Debug, Deserialize)]
pub struct JestTestResult {
    pub name: String,
    pub status: String,
    #[serde(rename = "assertionResults")]
    pub assertion_results: Vec<JestAssertionResult>,
}

#[derive(Debug, Deserialize)]
pub struct JestAssertionResult {
    pub title: String,
    #[serde(rename = "fullName")]
    pub full_name: String,
    pub status: String,
    #[serde(rename = "ancestorTitles")]
    pub ancestor_titles: Vec<String>,
    pub duration: Option<u64>,
    #[serde(rename = "failureMessages")]
    pub failure_messages: Vec<String>,
}
