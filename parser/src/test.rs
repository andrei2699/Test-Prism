use crate::test_models::TestSuite;
use std::path::Path;

pub trait TestParser {
    fn parse(&self, file_path: &Path) -> Result<Vec<TestSuite>, String>;
}
