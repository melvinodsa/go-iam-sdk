# Go IAM SDK

The Go IAM SDK is a lightweight library for integrating with the Go IAM server. It provides methods for authentication, user management, and resource creation.

> ✅ Admin UI: [go-iam-ui](https://github.com/melvinodsa/go-iam-ui)  
> 🐳 Docker Setup: [go-iam-docker](https://github.com/melvinodsa/go-iam-docker)  
> 🔐 Backend: [go-iam](https://github.com/melvinodsa/go-iam)  
> 📦 SDK: [go-iam-sdk](https://github.com/melvinodsa/go-iam-sdk)  
> 🚀 Examples: [go-iam-examples](https://github.com/melvinodsa/go-iam-examples)

## Installation

### Go

```bash
go get github.com/melvinodsa/go-iam-sdk/golang
```

### TypeScript

```bash
npm install @goiam/typescript
# or
pnpm add @goiam/typescript
# or
yarn add @goiam/typescript
```

### Python

```bash
pip install goiam-python
# or
poetry add goiam-python
# or
pipenv install goiam-python
```

### Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
goiam = "0.1.0"
tokio = { version = "1.0", features = ["full"] }
```

## Usage

### Go

#### Initialize the Service

```go
import (
	"context"
	goiam "github.com/melvinodsa/go-iam-sdk/golang"
)

func main() {
	service := goiam.NewService("https://go-iam.example.com", "your-client-id", "your-secret")
	// Use the service instance for API calls
}
```

#### Verify Authentication Code

```go
ctx := context.Background()
token, err := service.Verify(ctx, "auth-code")
if err != nil {
	log.Fatalf("Failed to verify code: %v", err)
}
fmt.Println("Access Token:", token)
```

#### Fetch Current User Information

```go
user, err := service.Me(ctx, token)
if err != nil {
	log.Fatalf("Failed to fetch user information: %v", err)
}
fmt.Printf("User: %+v\n", user)
```

#### Create a Resource

```go
resource := &golang.Resource{
	ID:          "resource-id",
	Name:        "Resource Name",
	Description: "Resource Description",
	Tags:        []string{"tag1", "tag2"},
}

err = service.CreateResource(ctx, resource)
if err != nil {
	log.Fatalf("Failed to create resource: %v", err)
}
fmt.Println("Resource created successfully")
```

### TypeScript

[![npm version](https://badge.fury.io/js/@goiam%2Ftypescript.svg)](https://badge.fury.io/js/@goiam%2Ftypescript)
[![npm downloads](https://img.shields.io/npm/dm/@goiam/typescript.svg)](https://www.npmjs.com/package/@goiam/typescript)

#### Initialize the SDK

```typescript
import { GoIamSdk } from "@goiam/typescript";

const sdk = new GoIamSdk(
  "https://go-iam.example.com",
  "your-client-id",
  "your-secret"
);
```

#### Verify Authentication Code

```typescript
const token = await sdk.verify("auth-code");
console.log("Access Token:", token);
```

#### Fetch Current User Information

```typescript
const user = await sdk.me(token);
console.log("User:", user);
```

#### Create a Resource

```typescript
const resource = {
  id: "resource-id",
  name: "Resource Name",
  description: "Resource Description",
  key: "resource-key",
  enabled: true,
  projectId: "project-id",
  createdBy: "creator",
  updatedBy: "updater",
};

await sdk.createResource(resource, token);
console.log("Resource created successfully");
```

### Python

[![PyPI version](https://badge.fury.io/py/goiam-python.svg)](https://badge.fury.io/py/goiam-python)
[![Python versions](https://img.shields.io/pypi/pyversions/goiam-python.svg)](https://pypi.org/project/goiam-python/)

#### Initialize the SDK

```python
from goiam import new_service

service = new_service(
    base_url="https://go-iam.example.com",
    client_id="your-client-id",
    secret="your-secret"
)
```

#### Verify Authentication Code

```python
try:
    token = service.verify("auth-code")
    print(f"Access Token: {token}")
except Exception as error:
    print(f"Failed to verify code: {error}")
```

#### Fetch Current User Information

```python
try:
    user = service.me(token)
    print(f"User: {user.name} ({user.email})")
except Exception as error:
    print(f"Failed to fetch user information: {error}")
```

#### Create a Resource

```python
from goiam import Resource

resource = Resource(
    id="resource-id",
    name="Resource Name",
    description="Resource Description",
    key="resource-key",
    enabled=True,
    project_id="project-id",
    created_by="creator",
    updated_by="updater"
)

try:
    service.create_resource(resource, token)
    print("Resource created successfully")
except Exception as error:
    print(f"Failed to create resource: {error}")
```

### Rust

[![Crates.io](https://img.shields.io/crates/v/goiam)](https://crates.io/crates/goiam)
[![Documentation](https://docs.rs/goiam/badge.svg)](https://docs.rs/goiam)

#### Initialize the SDK

```rust
use goiam::{new_service, Service};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = new_service(
        "https://go-iam.example.com".to_string(),
        "your-client-id".to_string(),
        "your-secret".to_string(),
    );

    // SDK usage here...
    Ok(())
}
```

#### Verify Authentication Code

```rust
match service.verify("auth-code").await {
    Ok(token) => println!("Access Token: {}", token),
    Err(error) => eprintln!("Failed to verify code: {}", error),
}
```

#### Fetch Current User Information

```rust
match service.me(&token).await {
    Ok(user) => println!("User: {} ({})", user.name, user.email),
    Err(error) => eprintln!("Failed to fetch user information: {}", error),
}
```

#### Create a Resource

```rust
use goiam::Resource;

let resource = Resource::new("resource-id".to_string(), "Resource Name".to_string());

match service.create_resource(&resource, &token).await {
    Ok(_) => println!("Resource created successfully"),
    Err(error) => eprintln!("Failed to create resource: {}", error),
}
```
