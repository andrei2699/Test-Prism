use crate::test_models::TestStatus;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct TestReport {
    pub version: u8,
    pub date: String,
    pub tests: Vec<TestReportTest>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TestReportStatus {
    #[serde(rename = "SUCCESS")]
    Success,
    #[serde(rename = "SKIPPED")]
    Skipped,
    #[serde(rename = "FAILURE")]
    Failure,
    #[serde(rename = "ERROR")]
    Error,
}

#[derive(Serialize, Deserialize)]
pub struct TestReportTest {
    #[serde(rename = "lastExecutionType")]
    pub last_execution_type: TestReportStatus,
    pub name: String,
    pub path: String,
    #[serde(rename = "durationMs")]
    pub duration_ms: u64,
    pub message: Option<String>,
}

impl TestReportStatus {
    pub fn from_test_status(status: TestStatus) -> TestReportStatus {
        match status {
            TestStatus::Passed => TestReportStatus::Success,
            TestStatus::Skipped(_) => TestReportStatus::Skipped,
            TestStatus::Failed(_) => TestReportStatus::Failure,
            TestStatus::Error(_) => TestReportStatus::Error,
        }
    }
}

impl TestReportTest {
    pub fn message_from_test_status(status: TestStatus) -> Option<String> {
        match status {
            TestStatus::Passed => None,
            TestStatus::Skipped(message) => Some(message),
            TestStatus::Failed(message) => Some(message),
            TestStatus::Error(message) => Some(message),
        }
    }
}
