use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenericMapping {
    pub version: u8,

    #[serde(default = "default_time_unit")]
    pub time_unit: String,

    pub suite_path: String,

    #[serde(default)]
    pub suite_name: Option<String>,

    #[serde(default)]
    pub suite_file: Option<String>,

    #[serde(default)]
    pub suite_timestamp: Option<String>,

    #[serde(default)]
    pub suite_duration: Option<String>,

    pub test_path: String,

    pub test_name: String,

    pub test_status: String,

    #[serde(default)]
    pub test_time: Option<String>,

    #[serde(default)]
    pub test_message: Option<String>,

    #[serde(default)]
    pub test_ancestor_titles: Option<String>,

    pub status_map: HashMap<String, String>,
}

fn default_time_unit() -> String {
    "s".to_string()
}

impl GenericMapping {
    const REQUIRED_FIELDS: &'static [&'static str] = &[
        "version",
        "suitePath",
        "testPath",
        "testName",
        "testStatus",
        "statusMap",
    ];

    const VALID_STATUSES: &'static [&'static str] = &["passed", "failed", "skipped", "error"];

    pub fn validate_raw(raw: &serde_json::Value) -> Result<(), String> {
        let obj = raw
            .as_object()
            .ok_or_else(|| "Mapping must be a JSON object".to_string())?;

        for field in Self::REQUIRED_FIELDS {
            match obj.get(*field) {
                None | Some(serde_json::Value::Null) => {
                    return Err(format!("Missing required field: {}", field));
                }
                _ => {}
            }
        }

        let version = obj
            .get("version")
            .and_then(|v| v.as_u64())
            .ok_or_else(|| "Field 'version' must be a positive integer".to_string())?;
        if version != 1 {
            return Err(format!("Unsupported mapping version: {} (only 1 supported)", version));
        }

        let status_map = obj
            .get("statusMap")
            .and_then(|v| v.as_object())
            .ok_or_else(|| "Field 'statusMap' must be an object".to_string())?;
        if status_map.is_empty() {
            return Err("Field 'statusMap' must not be empty".to_string());
        }
        for (_source, target) in status_map {
            let target_str = target
                .as_str()
                .ok_or_else(|| "statusMap values must be strings".to_string())?;
            if !Self::VALID_STATUSES.contains(&target_str) {
                return Err(format!(
                    "Invalid statusMap target '{}': must be one of passed, failed, skipped, error",
                    target_str
                ));
            }
        }

        if let Some(time_unit) = obj.get("timeUnit").filter(|v| !v.is_null()) {
            let tu = time_unit
                .as_str()
                .ok_or_else(|| "Field 'timeUnit' must be a string".to_string())?;
            if tu != "s" && tu != "ms" {
                return Err(format!(
                    "Invalid timeUnit '{}': must be 's' or 'ms'",
                    tu
                ));
            }
        }

        Ok(())
    }

    pub fn from_file(path: &std::path::Path) -> Result<Self, String> {
        let content =
            std::fs::read_to_string(path).map_err(|e| format!("Cannot read mapping file: {}", e))?;
        Self::from_str(&content)
    }

    pub fn from_str(content: &str) -> Result<Self, String> {
        let raw: serde_json::Value =
            serde_json::from_str(content).map_err(|e| format!("Invalid mapping JSON: {}", e))?;
        Self::validate_raw(&raw)?;
        let mapping: GenericMapping =
            serde_json::from_value(raw).map_err(|e| format!("Mapping deserialization failed: {}", e))?;
        Ok(mapping)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_mapping_json() -> serde_json::Value {
        serde_json::json!({
            "version": 1,
            "timeUnit": "s",
            "suitePath": "$.testResults[*]",
            "suiteName": "$.name",
            "testPath": "$.assertionResults[*]",
            "testName": "$.title",
            "testStatus": "$.status",
            "statusMap": {
                "passed": "passed",
                "failed": "failed",
                "skipped": "skipped"
            }
        })
    }

    #[test]
    fn validate_accepts_minimal_valid_mapping() {
        let mut mapping = valid_mapping_json();
        mapping.as_object_mut().unwrap().remove("timeUnit");
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_ok(), "{}", result.unwrap_err());
    }

    #[test]
    fn validate_accepts_full_mapping() {
        let mapping = valid_mapping_json();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_ok(), "{}", result.unwrap_err());
    }

    #[test]
    fn validate_rejects_missing_version() {
        let mut mapping = valid_mapping_json();
        mapping["version"].take();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("version"));
    }

    #[test]
    fn validate_rejects_unsupported_version() {
        let mut mapping = valid_mapping_json();
        mapping["version"] = serde_json::json!(2);
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("version"));
    }

    #[test]
    fn validate_rejects_missing_suite_path() {
        let mut mapping = valid_mapping_json();
        mapping["suitePath"].take();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("suitePath"));
    }

    #[test]
    fn validate_rejects_missing_test_path() {
        let mut mapping = valid_mapping_json();
        mapping["testPath"].take();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("testPath"));
    }

    #[test]
    fn validate_rejects_missing_test_name() {
        let mut mapping = valid_mapping_json();
        mapping["testName"].take();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("testName"));
    }

    #[test]
    fn validate_rejects_missing_test_status() {
        let mut mapping = valid_mapping_json();
        mapping["testStatus"].take();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("testStatus"));
    }

    #[test]
    fn validate_rejects_missing_status_map() {
        let mut mapping = valid_mapping_json();
        mapping["statusMap"].take();
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("statusMap"));
    }

    #[test]
    fn validate_rejects_empty_status_map() {
        let mut mapping = valid_mapping_json();
        mapping["statusMap"] = serde_json::json!({});
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("statusMap"));
    }

    #[test]
    fn validate_rejects_invalid_status_map_target() {
        let mut mapping = valid_mapping_json();
        mapping["statusMap"]["passed"] = serde_json::json!("unknown");
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("unknown"));
    }

    #[test]
    fn validate_rejects_invalid_time_unit() {
        let mut mapping = valid_mapping_json();
        mapping["timeUnit"] = serde_json::json!("hours");
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("timeUnit"));
    }

    #[test]
    fn validate_rejects_non_object_mapping() {
        let mapping = serde_json::json!([1, 2, 3]);
        let result = GenericMapping::validate_raw(&mapping);
        assert!(result.is_err());
    }

    #[test]
    fn from_str_parses_valid_mapping() {
        let json = serde_json::to_string(&valid_mapping_json()).unwrap();
        let result = GenericMapping::from_str(&json);
        assert!(result.is_ok(), "{}", result.unwrap_err());
        let mapping = result.unwrap();
        assert_eq!(mapping.version, 1);
        assert_eq!(mapping.time_unit, "s");
        assert_eq!(mapping.suite_path, "$.testResults[*]");
        assert_eq!(mapping.status_map.get("passed"), Some(&"passed".to_string()));
    }

    #[test]
    fn from_str_defaults_time_unit_to_seconds_when_absent() {
        let mut mapping = valid_mapping_json();
        mapping.as_object_mut().unwrap().remove("timeUnit");
        let json = serde_json::to_string(&mapping).unwrap();
        let result = GenericMapping::from_str(&json).unwrap();
        assert_eq!(result.time_unit, "s");
    }

    #[test]
    fn from_str_rejects_invalid_mapping() {
        let mut mapping = valid_mapping_json();
        mapping["version"] = serde_json::json!(5);
        let json = serde_json::to_string(&mapping).unwrap();
        let result = GenericMapping::from_str(&json);
        assert!(result.is_err());
    }
}
