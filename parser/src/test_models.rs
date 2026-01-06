#[derive(Debug, Clone)]
pub struct TestSuite {
    pub name: String,
    pub duration: f64,
    pub timestamp: String,
    pub tests: Vec<Test>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TestStatus {
    Passed,
    Skipped(String),
    Failed(String),
    Error(String),
}

#[derive(Debug, Clone)]
pub struct Test {
    pub name: String,
    pub time: f64,
    pub status: TestStatus,
}
