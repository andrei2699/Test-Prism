use crate::test_models::TestStatus;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct TestReport {
    pub version: u8,
    pub timestamp: String,
    pub tests: Vec<TestReportTest>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TestExecutionStatus {
    #[serde(rename = "PASSED")]
    Passed,
    #[serde(rename = "SKIPPED")]
    Skipped,
    #[serde(rename = "FAILED")]
    Failed,
    #[serde(rename = "ERROR")]
    Error,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TestExecution {
    pub timestamp: String,
    pub status: TestExecutionStatus,
    #[serde(rename = "durationMs")]
    pub duration_ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TestReportTest {
    pub name: String,
    pub path: String,
    pub executions: Vec<TestExecution>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}

impl TestExecutionStatus {
    pub fn from_test_status(status: &TestStatus) -> TestExecutionStatus {
        match status {
            TestStatus::Passed => TestExecutionStatus::Passed,
            TestStatus::Skipped(_) => TestExecutionStatus::Skipped,
            TestStatus::Failed(_) => TestExecutionStatus::Failed,
            TestStatus::Error(_) => TestExecutionStatus::Error,
        }
    }
}

impl TestExecution {
    pub fn message_from_test_status(status: &TestStatus) -> Option<String> {
        match status {
            TestStatus::Passed => None,
            TestStatus::Skipped(message) => Some(message.clone()),
            TestStatus::Failed(message) => Some(message.clone()),
            TestStatus::Error(message) => Some(message.clone()),
        }
    }
}
