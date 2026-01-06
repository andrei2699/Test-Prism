#[derive(Debug, Clone)]
pub struct TestSuite {
    pub name: String,
    pub duration: f64,
    pub timestamp: String,
    pub methods: Vec<Test>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TestStatus {
    Passed,
    Skipped,
    Failed,
    Error,
}

#[derive(Debug, Clone)]
pub struct Test {
    pub name: String,
    pub time: f64,
    pub status: TestStatus,
}
