# TypeScript SDK Makefile
SHELL := /bin/bash

.PHONY: help install build test test-coverage test-watch clean lint lint-fix format format-check type-check dev audit check pr-ready

## Help
help: ## Show this help message
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Dependencies
install: ## Install dependencies
	pnpm install

install-ci: ## Install dependencies (CI mode)
	pnpm install --frozen-lockfile

## Building
build: ## Build the project
	npm run build

clean: ## Clean build artifacts and coverage
	npm run clean

dev: ## Start development mode (watch)
	npm run dev

## Testing
test: ## Run tests
	npm test

test-coverage: ## Run tests with coverage
	npm run test:coverage

test-watch: ## Run tests in watch mode
	npm run test:watch

## Code Quality
lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint and fix issues
	npm run lint:fix

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting
	npm run format:check

type-check: ## Run TypeScript type checking
	npm run type-check

## Security
audit: ## Run security audit
	pnpm audit --audit-level moderate

audit-fix: ## Fix security issues
	pnpm audit --fix

## Comprehensive Checks
check: format-check lint type-check test ## Run all checks (format, lint, type-check, test)

pr-ready: clean install-ci format-check lint type-check test-coverage build audit ## Prepare for pull request
	@echo "✅ All checks passed - ready for PR!"

## Package Management
pack: ## Create package tarball
	npm pack

publish-dry: ## Dry run publish
	npm publish --dry-run

## Development Utilities
deps-update: ## Update dependencies
	pnpm update

deps-outdated: ## Check for outdated dependencies
	pnpm outdated

info: ## Show project information
	@echo "Project: $$(node -p 'require("./package.json").name')"
	@echo "Version: $$(node -p 'require("./package.json").version')"
	@echo "Node version: $$(node --version)"
	@echo "npm version: $$(npm --version)"
	@echo "pnpm version: $$(pnpm --version || echo 'Not installed')"
