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

## Usage

### Go

This SDK currently supports Go. Support for other languages will be added soon.

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
