use crate::error::{GoIamError, Result};
use crate::service::Service;
use crate::types::{AuthCallbackResponse, Resource, ResourceResponse, User, UserResponse};
use base64::{engine::general_purpose, Engine as _};
use reqwest::Client;

pub struct ServiceImpl {
    base_url: String,
    client_id: String,
    secret: String,
    client: Client,
}

impl ServiceImpl {
    pub fn new(base_url: String, client_id: String, secret: String) -> Self {
        Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            client_id,
            secret,
            client: Client::new(),
        }
    }

    fn basic_auth(&self) -> String {
        let credentials = format!("{}:{}", self.client_id, self.secret);
        format!("Basic {}", general_purpose::STANDARD.encode(credentials))
    }
}

#[async_trait::async_trait]
impl Service for ServiceImpl {
    async fn verify(&self, code: &str) -> Result<String> {
        let url = format!("{}/auth/v1/verify", self.base_url);

        let response = self
            .client
            .get(&url)
            .query(&[("code", code)])
            .header("Authorization", self.basic_auth())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(GoIamError::ApiError {
                message: format!("Failed to verify code: {}", response.status()),
                status: response.status().as_u16(),
            });
        }

        let auth_response: AuthCallbackResponse = response.json().await?;

        if !auth_response.success {
            return Err(GoIamError::AuthError {
                message: auth_response
                    .message
                    .unwrap_or_else(|| "Authentication failed".to_string()),
            });
        }

        match auth_response.data {
            Some(data) => Ok(data.access_token),
            None => Err(GoIamError::InvalidResponse {
                message: "No access token received".to_string(),
            }),
        }
    }

    async fn me(&self, token: &str) -> Result<User> {
        let url = format!("{}/me/v1/me", self.base_url);

        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", token))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(GoIamError::ApiError {
                message: format!("Failed to fetch user information: {}", response.status()),
                status: response.status().as_u16(),
            });
        }

        let user_response: UserResponse = response.json().await?;

        if !user_response.success {
            return Err(GoIamError::AuthError {
                message: user_response
                    .message
                    .unwrap_or_else(|| "User fetch failed".to_string()),
            });
        }

        match user_response.data {
            Some(user) => Ok(user),
            None => Err(GoIamError::InvalidResponse {
                message: "No user data received".to_string(),
            }),
        }
    }

    async fn create_resource(&self, resource: &Resource, token: &str) -> Result<()> {
        let url = format!("{}/resource/v1/", self.base_url);

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", token))
            .header("Content-Type", "application/json")
            .json(resource)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(GoIamError::ApiError {
                message: format!("Failed to create resource: {}", response.status()),
                status: response.status().as_u16(),
            });
        }

        let resource_response: ResourceResponse = response.json().await?;

        if !resource_response.success {
            return Err(GoIamError::AuthError {
                message: resource_response
                    .message
                    .unwrap_or_else(|| "Resource creation failed".to_string()),
            });
        }

        Ok(())
    }
}

/// Create a new instance of the Go IAM service
pub fn new_service(base_url: String, client_id: String, secret: String) -> impl Service {
    ServiceImpl::new(base_url, client_id, secret)
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockito::Server;

    #[tokio::test]
    async fn test_verify_success() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("GET", "/auth/v1/verify?code=valid-code")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":true,"data":{"access_token":"test-token"}}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.verify("valid-code").await;
        mock.assert_async().await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "test-token");
    }

    #[tokio::test]
    async fn test_verify_failure() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("GET", "/auth/v1/verify?code=invalid-code")
            .with_status(401)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":false,"message":"Invalid code"}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.verify("invalid-code").await;
        mock.assert_async().await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_me_success() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("GET", "/me/v1/me")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":true,"data":{"id":"user-id","project_id":"","name":"Test User","email":"test@example.com","phone":"","enabled":true,"profile_pic":"","expiry":null,"roles":{},"resources":{},"policies":{},"created_at":null,"created_by":"","updated_at":null,"updated_by":""}}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.me("valid-token").await;
        mock.assert_async().await;

        assert!(result.is_ok());
        let user = result.unwrap();
        assert_eq!(user.id, "user-id");
        assert_eq!(user.name, "Test User");
        assert_eq!(user.email, "test@example.com");
    }

    #[tokio::test]
    async fn test_me_failure() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("GET", "/me/v1/me")
            .with_status(401)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":false,"message":"Invalid token"}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.me("invalid-token").await;
        mock.assert_async().await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_create_resource_success() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("POST", "/resource/v1/")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":true,"message":"Resource created successfully"}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let resource = Resource::new("resource-1".to_string(), "Test Resource".to_string(), "test-key".to_string());
        let result = service.create_resource(&resource, "valid-token").await;
        mock.assert_async().await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_create_resource_failure() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("POST", "/resource/v1/")
            .with_status(401)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":false,"message":"Invalid token"}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let resource = Resource::new("resource-1".to_string(), "Test Resource".to_string(), "test-key".to_string());
        let result = service.create_resource(&resource, "invalid-token").await;
        mock.assert_async().await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_service_base_url_trimming() {
        let service = ServiceImpl::new(
            "https://example.com/".to_string(), // URL with trailing slash
            "client".to_string(),
            "secret".to_string(),
        );

        // The base URL should be trimmed
        assert_eq!(service.base_url, "https://example.com");
    }

    #[tokio::test]
    async fn test_basic_auth_encoding() {
        let service = ServiceImpl::new(
            "https://example.com".to_string(),
            "test_client".to_string(),
            "test_secret".to_string(),
        );

        let auth_header = service.basic_auth();
        assert!(auth_header.starts_with("Basic "));

        // Decode and verify the credentials
        let encoded = auth_header.strip_prefix("Basic ").unwrap();
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(encoded)
            .expect("Failed to decode base64");
        let credentials = String::from_utf8(decoded).expect("Failed to convert to string");
        assert_eq!(credentials, "test_client:test_secret");
    }

    #[tokio::test]
    async fn test_verify_network_error() {
        // Test with invalid URL to simulate network error
        let service = ServiceImpl::new(
            "http://invalid-url-that-does-not-exist.local".to_string(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.verify("some-code").await;
        assert!(result.is_err());
        match result.unwrap_err() {
            crate::error::GoIamError::HttpError(_) => {} // Expected
            _ => panic!("Expected HttpError for network failure"),
        }
    }

    #[tokio::test]
    async fn test_verify_malformed_response() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("GET", "/auth/v1/verify?code=test-code")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body("invalid json")
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.verify("test-code").await;
        mock.assert_async().await;

        assert!(result.is_err());
        match result.unwrap_err() {
            crate::error::GoIamError::JsonError(_) => {} // Expected
            crate::error::GoIamError::HttpError(_) => {} // Also acceptable - reqwest might handle invalid JSON differently
            _ => panic!("Expected JsonError or HttpError for malformed JSON"),
        }
    }

    #[tokio::test]
    async fn test_verify_success_no_data() {
        let mut server = Server::new_async().await;
        let mock = server
            .mock("GET", "/auth/v1/verify?code=test-code")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"success":true}"#)
            .create_async()
            .await;

        let service = ServiceImpl::new(
            server.url(),
            "test-client-id".to_string(),
            "test-secret".to_string(),
        );

        let result = service.verify("test-code").await;
        mock.assert_async().await;

        assert!(result.is_err());
        match result.unwrap_err() {
            crate::error::GoIamError::InvalidResponse { message } => {
                assert!(message.contains("No access token received"));
            }
            _ => panic!("Expected InvalidResponse error"),
        }
    }
}
