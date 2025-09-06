//! # GoIAM Rust SDK
//!
//! A lightweight Rust SDK for integrating with Go IAM server.
//! Provides methods for authentication, user management, and resource creation.
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use goiam::{new_service, Resource, Service};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let service = new_service(
//!         "https://go-iam.example.com".to_string(),
//!         "your-client-id".to_string(),
//!         "your-secret".to_string(),
//!     );
//!     
//!     // Verify authentication code
//!     let token = service.verify("auth-code").await?;
//!     
//!     // Get user information
//!     let user = service.me(&token).await?;
//!     println!("User: {} ({})", user.name, user.email);
//!     
//!     // Create a resource
//!     let resource = Resource::new("Resource Name".to_string(), "A sample resource".to_string(), "resource-key".to_string());
//!     service.create_resource(&resource, &token).await?;
//!     
//!     Ok(())
//! }
//! ```

pub mod error;
pub mod service;
pub mod service_impl;
pub mod types;

pub use error::{GoIamError, Result};
pub use service::Service;
pub use service_impl::{new_service, ServiceImpl};
pub use types::{Resource, User, UserResource, UserRole};
