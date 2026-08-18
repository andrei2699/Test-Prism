use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct VitestReport {
    #[serde(rename = "testResults")]
    pub test_results: Vec<VitestFileResult>,
}

#[derive(Debug, Deserialize)]
pub struct VitestFileResult {
    pub name: String,
    #[serde(rename = "assertionResults")]
    pub assertion_results: Vec<VitestAssertion>,
}

#[derive(Debug, Deserialize)]
pub struct VitestAssertion {
    pub title: String,
    #[serde(rename = "fullName")]
    pub full_name: String,
    pub status: String,
    #[serde(rename = "ancestorTitles")]
    pub ancestor_titles: Vec<String>,
    pub duration: Option<f64>,
    #[serde(rename = "failureMessages")]
    pub failure_messages: Vec<String>,
    #[serde(rename = "consoleOutput", default)]
    pub console_output: Option<String>,
}
