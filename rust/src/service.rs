use crate::error::Result;
use crate::types::{Resource, User};

#[async_trait::async_trait]
pub trait Service: Send + Sync {
    /// Verify authentication code and return access token
    async fn verify(&self, code: &str) -> Result<String>;

    /// Get current user information
    async fn me(&self, token: &str) -> Result<User>;

    /// Create a new resource
    async fn create_resource(&self, resource: &Resource, token: &str) -> Result<()>;

    /// Delete a resource by ID
    async fn delete_resource(&self, resource_id: &str, token: &str) -> Result<()>;
}
