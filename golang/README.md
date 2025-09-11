# Go IAM SDK

Go SDK for interacting with Go IAM APIs.

## Development Setup

### Prerequisites

- Go 1.21 or later
- Make (for using the development workflow)

### Installation

```bash
go mod download
```

### Development Workflow

We provide a Makefile with common development tasks:

```bash
# Show all available commands
make help

# Run tests
make test

# Run tests with coverage
make test-coverage

# Run tests with race detection
make test-race

# Format code
make fmt

# Check formatting
make fmt-check

# Run linter
make lint

# Run go vet
make vet

# Build project
make build

# Install development tools
make install-tools

# Run all checks (recommended before committing)
make check

# Comprehensive PR preparation
make pr-ready
```

### Running Tests

```bash
# Basic test run
go test ./...

# With coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# With race detection
go test -race ./...
```

### Code Quality

This project uses:

- `gofmt` for code formatting
- `go vet` for static analysis
- `golangci-lint` for comprehensive linting
- `gosec` for security scanning
- `govulncheck` for vulnerability checking

### CI/CD

The project includes comprehensive GitHub Actions workflows:

- **pr-validation-golang.yml**: Validates Go code on pull requests
  - Runs tests across multiple Go versions and platforms
  - Checks code formatting and linting
  - Generates test coverage reports
  - Performs security scans
  - Tests cross-compilation for different OS/arch combinations

### Coverage Requirements

The project maintains a minimum test coverage threshold of 70%. Current coverage can be checked with:

```bash
make test-coverage
```

### Security

Security scanning is performed using:

- `gosec` for static security analysis
- `govulncheck` for known vulnerabilities

Run security checks locally:

```bash
make security
make audit
```

## Usage

```go
package main

import (
    "context"
    "fmt"
    "log"
    "github.com/melvinodsa/go-iam-sdk/golang"
)

func main() {
    // Initialize the service
    service := golang.NewService("https://your-iam-api.com", "client-id", "secret")
    ctx := context.Background()

    // Verify authentication code
    token, err := service.Verify(ctx, "auth-code")
    if err != nil {
        log.Fatalf("Failed to verify code: %v", err)
    }
    fmt.Printf("Access Token: %s\n", token)

    // Get current user information
    user, err := service.Me(ctx, token)
    if err != nil {
        log.Fatalf("Failed to fetch user: %v", err)
    }
    fmt.Printf("User: %s (%s)\n", user.Name, user.Email)

    // Create a resource
    resource := &golang.Resource{
        Name:        "Test Resource",
        Description: "A test resource",
        Key:         "test-key",
        Enabled:     true,
        ProjectId:   "project-123",
        CreatedBy:   "admin",
        UpdatedBy:   "admin",
    }
    
    err = service.CreateResource(ctx, resource, token)
    if err != nil {
        log.Fatalf("Failed to create resource: %v", err)
    }
    fmt.Println("Resource created successfully")

    // Delete a resource
    err = service.DeleteResource(ctx, "resource-id", token)
    if err != nil {
        log.Fatalf("Failed to delete resource: %v", err)
    }
    fmt.Println("Resource deleted successfully")
}
```
