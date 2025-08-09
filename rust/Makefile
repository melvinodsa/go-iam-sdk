# Makefile for Rust SDK
.PHONY: help test test-coverage build clean docs lint fmt check install-tools pr-ready

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test: ## Run all tests
	cargo test --verbose

test-coverage: ## Run tests with coverage
	cargo tarpaulin --verbose --all-features --workspace --timeout 120

test-release: ## Run tests in release mode
	cargo test --release --verbose

build: ## Build the project
	cargo build --verbose

build-release: ## Build in release mode
	cargo build --release --verbose

clean: ## Clean build artifacts
	cargo clean

docs: ## Generate and open documentation
	cargo doc --no-deps --all-features --open

lint: ## Run clippy linter
	cargo clippy --all-targets --all-features -- -D warnings

fmt: ## Format code
	cargo fmt --all

fmt-check: ## Check code formatting
	cargo fmt --all -- --check

audit: ## Check for security vulnerabilities
	cargo audit

install-tools: ## Install required development tools
	cargo install cargo-tarpaulin cargo-audit cargo-watch

check: fmt-check lint test ## Run all checks

pr-ready: fmt check test-coverage ## Prepare for pull request

watch: ## Watch for changes and run tests
	cargo watch -x test
