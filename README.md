# Go IAM SDK

The Go IAM SDK is a lightweight library for integrating with the Go IAM server. It provides methods for authentication, user management, and resource creation.

> ✅ Admin UI: [go-iam-ui](https://github.com/melvinodsa/go-iam-ui)  
> 🐳 Docker Setup: [go-iam-docker](https://github.com/melvinodsa/go-iam-docker)  
> 🔐 Backend: [go-iam](https://github.com/melvinodsa/go-iam)  
> 📦 SDK: [go-iam-sdk](https://github.com/melvinodsa/go-iam-sdk)

## Installation

```bash
go get github.com/melvinodsa/go-iam-sdk/golang
```

## Usage (Go)

This SDK currently supports Go. Support for other languages will be added soon.

### Initialize the Service

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

### Verify Authentication Code

```go
ctx := context.Background()
token, err := service.Verify(ctx, "auth-code")
if err != nil {
	log.Fatalf("Failed to verify code: %v", err)
}
fmt.Println("Access Token:", token)
```

### Fetch Current User Information

```go
user, err := service.Me(ctx, token)
if err != nil {
	log.Fatalf("Failed to fetch user information: %v", err)
}
fmt.Printf("User: %+v\n", user)
```

### Create a Resource

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
