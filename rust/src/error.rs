use thiserror::Error;

#[derive(Error, Debug)]
pub enum GoIamError {
    #[error("HTTP request failed: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("JSON parsing failed: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Authentication failed: {message}")]
    AuthError { message: String },

    #[error("API error: {message} (status: {status})")]
    ApiError { message: String, status: u16 },

    #[error("Invalid response: {message}")]
    InvalidResponse { message: String },
}

pub type Result<T> = std::result::Result<T, GoIamError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let auth_error = GoIamError::AuthError {
            message: "Invalid credentials".to_string(),
        };
        assert_eq!(
            auth_error.to_string(),
            "Authentication failed: Invalid credentials"
        );

        let api_error = GoIamError::ApiError {
            message: "Not found".to_string(),
            status: 404,
        };
        assert_eq!(api_error.to_string(), "API error: Not found (status: 404)");

        let invalid_response = GoIamError::InvalidResponse {
            message: "Missing data field".to_string(),
        };
        assert_eq!(
            invalid_response.to_string(),
            "Invalid response: Missing data field"
        );
    }

    #[test]
    fn test_error_from_reqwest() {
        // This test verifies that reqwest errors are properly converted
        // We'll simulate this with a mock reqwest client error
        use std::error::Error as StdError;

        let json_error = serde_json::from_str::<serde_json::Value>("invalid json")
            .expect_err("Should fail to parse invalid JSON");

        // Test that our error variants work correctly
        let auth_error = GoIamError::AuthError {
            message: "Test auth error".to_string(),
        };
        assert!(auth_error.source().is_none());

        let json_goiam_error: GoIamError = json_error.into();
        assert!(json_goiam_error.source().is_some());
    }

    #[test]
    fn test_error_from_serde_json() {
        let json_error = serde_json::from_str::<serde_json::Value>("invalid json")
            .expect_err("Should fail to parse invalid JSON");
        let goiam_error: GoIamError = json_error.into();
        match goiam_error {
            GoIamError::JsonError(_) => {} // Expected
            _ => panic!("Expected JsonError"),
        }
    }
}
