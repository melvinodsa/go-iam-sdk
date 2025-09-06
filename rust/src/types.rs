use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct User {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub enabled: bool,
    pub profile_pic: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub linked_client_id: Option<String>,
    pub expiry: Option<String>,
    pub roles: HashMap<String, UserRole>,
    pub resources: HashMap<String, UserResource>,
    pub policies: HashMap<String, UserPolicy>,
    pub created_at: Option<String>,
    pub created_by: String,
    pub updated_at: Option<String>,
    pub updated_by: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserPolicy {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mapping: Option<UserPolicyMapping>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserPolicyMapping {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub arguments: Option<HashMap<String, UserPolicyMappingValue>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserPolicyMappingValue {
    #[serde(rename = "static", skip_serializing_if = "Option::is_none")]
    pub static_val: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserRole {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserResource {
    pub role_ids: HashMap<String, bool>,
    pub policy_ids: HashMap<String, bool>,
    pub key: String,
    pub name: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Resource {
    pub id: String,
    pub name: String,
    pub description: String,
    pub key: String,
    pub enabled: bool,
    pub project_id: String,
    pub created_at: Option<String>,
    pub created_by: String,
    pub updated_at: Option<String>,
    pub updated_by: String,
    pub deleted_at: Option<String>,
}

impl Resource {
    pub fn new(name: String, description: String, key: String) -> Self {
        Self {
            id: String::new(),
            name,
            description,
            key,
            enabled: true,
            project_id: String::new(),
            created_at: None,
            created_by: String::new(),
            updated_at: None,
            updated_by: String::new(),
            deleted_at: None,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct AuthVerifyCodeResponse {
    pub access_token: String,
}

#[derive(Debug, Deserialize)]
pub struct AuthCallbackResponse {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<AuthVerifyCodeResponse>,
}

#[derive(Debug, Deserialize)]
pub struct UserResponse {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<User>,
}

#[derive(Debug, Deserialize)]
pub struct ResourceResponse {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<Resource>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json;

    #[test]
    fn test_user_serialization() {
        let mut roles = HashMap::new();
        roles.insert(
            "admin".to_string(),
            UserRole {
                id: "role-1".to_string(),
                name: "Administrator".to_string(),
            },
        );

        let mut resources = HashMap::new();
        resources.insert(
            "resource-1".to_string(),
            UserResource {
                role_ids: HashMap::new(),
                policy_ids: HashMap::new(),
                key: "users".to_string(),
                name: "User Management".to_string(),
            },
        );

        let mut policies = HashMap::new();
        policies.insert(
            "policy-1".to_string(),
            UserPolicy {
                name: "read:users".to_string(),
                mapping: None,
            },
        );

        let user = User {
            id: "user-123".to_string(),
            project_id: "proj-456".to_string(),
            name: "John Doe".to_string(),
            email: "john@example.com".to_string(),
            phone: "+1234567890".to_string(),
            enabled: true,
            profile_pic: "avatar.jpg".to_string(),
            linked_client_id: None,
            expiry: Some("2025-12-31T23:59:59Z".to_string()),
            roles,
            resources,
            policies,
            created_at: Some("2024-01-01T00:00:00Z".to_string()),
            created_by: "admin".to_string(),
            updated_at: Some("2024-06-01T00:00:00Z".to_string()),
            updated_by: "admin".to_string(),
        };

        // Test serialization
        let json = serde_json::to_string(&user).expect("Failed to serialize user");
        assert!(json.contains("\"id\":\"user-123\""));
        assert!(json.contains("\"email\":\"john@example.com\""));

        // Test deserialization
        let deserialized: User = serde_json::from_str(&json).expect("Failed to deserialize user");
        assert_eq!(deserialized.id, user.id);
        assert_eq!(deserialized.email, user.email);
        assert_eq!(deserialized.enabled, user.enabled);
    }

    #[test]
    fn test_user_policy_mapping_value_static_field() {
        let mapping_value = UserPolicyMappingValue {
            static_val: Some("test-value".to_string()),
        };

        // Test serialization with renamed field
        let json =
            serde_json::to_string(&mapping_value).expect("Failed to serialize mapping value");
        assert!(json.contains("\"static\":\"test-value\""));

        // Test deserialization
        let json_input = r#"{"static":"deserialized-value"}"#;
        let deserialized: UserPolicyMappingValue =
            serde_json::from_str(json_input).expect("Failed to deserialize mapping value");
        assert_eq!(deserialized.static_val.unwrap(), "deserialized-value");
    }

    #[test]
    fn test_resource_new_constructor() {
        let resource = Resource::new("Test Resource".to_string(), "A test resource".to_string(), "test-key".to_string());

        assert_eq!(resource.id, "");
        assert_eq!(resource.name, "Test Resource");
        assert_eq!(resource.description, "A test resource");
        assert_eq!(resource.key, "test-key");
        assert!(resource.enabled);
        assert_eq!(resource.project_id, "");
        assert_eq!(resource.created_by, "");
        assert_eq!(resource.updated_by, "");
        assert!(resource.created_at.is_none());
        assert!(resource.updated_at.is_none());
        assert!(resource.deleted_at.is_none());
    }

    #[test]
    fn test_resource_serialization() {
        let resource = Resource {
            id: "res-1".to_string(),
            name: "Test Resource".to_string(),
            description: "A test resource".to_string(),
            key: "test-key".to_string(),
            enabled: true,
            project_id: "proj-1".to_string(),
            created_at: Some("2024-01-01T00:00:00Z".to_string()),
            created_by: "admin".to_string(),
            updated_at: Some("2024-06-01T00:00:00Z".to_string()),
            updated_by: "admin".to_string(),
            deleted_at: None,
        };

        let json = serde_json::to_string(&resource).expect("Failed to serialize resource");
        assert!(json.contains("\"id\":\"res-1\""));
        assert!(json.contains("\"enabled\":true"));

        let deserialized: Resource =
            serde_json::from_str(&json).expect("Failed to deserialize resource");
        assert_eq!(deserialized.id, resource.id);
        assert_eq!(deserialized.enabled, resource.enabled);
    }

    #[test]
    fn test_auth_callback_response_deserialization() {
        // Test successful response
        let json = r#"{"success":true,"data":{"access_token":"test-token"}}"#;
        let response: AuthCallbackResponse =
            serde_json::from_str(json).expect("Failed to deserialize auth callback response");

        assert!(response.success);
        assert!(response.message.is_none());
        assert!(response.data.is_some());
        assert_eq!(response.data.unwrap().access_token, "test-token");

        // Test failure response
        let json = r#"{"success":false,"message":"Invalid code"}"#;
        let response: AuthCallbackResponse =
            serde_json::from_str(json).expect("Failed to deserialize auth callback response");

        assert!(!response.success);
        assert_eq!(response.message.unwrap(), "Invalid code");
        assert!(response.data.is_none());
    }

    #[test]
    fn test_user_response_deserialization() {
        // Test with user data
        let json = r#"{"success":true,"data":{"id":"user-1","project_id":"","name":"Test","email":"test@example.com","phone":"","enabled":true,"profile_pic":"","expiry":null,"roles":{},"resources":{},"policies":{},"created_at":null,"created_by":"","updated_at":null,"updated_by":""}}"#;
        let response: UserResponse =
            serde_json::from_str(json).expect("Failed to deserialize user response");

        assert!(response.success);
        assert!(response.data.is_some());
        let user = response.data.unwrap();
        assert_eq!(user.id, "user-1");
        assert_eq!(user.email, "test@example.com");
    }

    #[test]
    fn test_resource_response_deserialization() {
        let json = r#"{"success":true,"message":"Resource created"}"#;
        let response: ResourceResponse =
            serde_json::from_str(json).expect("Failed to deserialize resource response");

        assert!(response.success);
        assert_eq!(response.message.unwrap(), "Resource created");
        assert!(response.data.is_none());
    }

    #[test]
    fn test_user_role_serialization() {
        let role = UserRole {
            id: "role-1".to_string(),
            name: "Admin".to_string(),
        };

        let json = serde_json::to_string(&role).expect("Failed to serialize user role");
        assert!(json.contains("\"id\":\"role-1\""));
        assert!(json.contains("\"name\":\"Admin\""));
    }

    #[test]
    fn test_user_resource_serialization() {
        let resource = UserResource {
            role_ids: HashMap::new(),
            policy_ids: HashMap::new(),
            key: "users".to_string(),
            name: "User Management".to_string(),
        };

        let json = serde_json::to_string(&resource).expect("Failed to serialize user resource");
        assert!(json.contains("\"key\":\"users\""));
        assert!(json.contains("\"name\":\"User Management\""));
    }
}
