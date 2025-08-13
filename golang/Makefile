# Go SDK Makefile
SHELL := /bin/bash

.PHONY: help test test-coverage test-race build clean lint fmt fmt-check vet install-tools check pr-ready security audit

## Help
help: ## Show this help message
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Testing
test: ## Run all tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	go tool cover -func=coverage.out

test-race: ## Run tests with race detection
	go test -v -race ./...

## Building
build: ## Build the project
	go build -v ./...

build-release: ## Build with optimizations
	go build -v -ldflags="-s -w" ./...

clean: ## Clean build artifacts and test files
	go clean ./...
	rm -f coverage.out coverage.html

## Code Quality
lint: ## Run golangci-lint
	golangci-lint run --verbose

fmt: ## Format code
	go fmt ./...
	gofmt -s -w .

fmt-check: ## Check code formatting
	@if [ "$$(gofmt -s -l . | wc -l)" -gt 0 ]; then \
		echo "The following files are not properly formatted:"; \
		gofmt -s -l .; \
		echo "Please run 'make fmt' to fix formatting issues."; \
		exit 1; \
	fi

vet: ## Run go vet
	go vet ./...

## Dependencies
deps: ## Download dependencies
	go mod download
	go mod verify

deps-update: ## Update dependencies
	go get -u ./...
	go mod tidy

## Security
security: ## Run security checks
	gosec -fmt json -out gosec-report.json ./...

audit: ## Check for vulnerabilities
	govulncheck ./...

## Development Tools
install-tools: ## Install required development tools
	@echo "Installing development tools..."
	go install honnef.co/go/tools/cmd/staticcheck@latest
	go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	go install golang.org/x/vuln/cmd/govulncheck@latest
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(shell go env GOPATH)/bin v1.55.2

## Comprehensive Checks
check: fmt-check vet lint test ## Run all checks (formatting, linting, testing)

pr-ready: fmt-check vet lint test-coverage security ## Prepare for pull request (comprehensive checks)
	@echo "✅ All checks passed - ready for PR!"

## Benchmarks
bench: ## Run benchmarks
	go test -bench=. -benchmem ./...

## Documentation
docs: ## Generate and view documentation
	godoc -http=:6060
	@echo "Documentation server started at http://localhost:6060"
