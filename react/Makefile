.PHONY: help install build test lint format clean dev watch

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

install-dev: ## Install dependencies including dev dependencies
	npm install --include=dev

build: ## Build the library
	npm run build

build-watch: ## Build the library in watch mode
	npm run build:watch

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

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

dev: ## Start development mode (watch)
	npm run dev

link-local: build ## Create local npm link for testing
	npm run link:local

unlink-local: ## Remove local npm link
	npm run unlink:local

pack-local: build ## Create local package for testing
	npm run pack:local

install-local: ## Install package locally for testing
	npm run install:local

clean: ## Clean build artifacts
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/.cache/

clean-all: clean ## Clean everything including node_modules
	rm -rf node_modules/

publish-dry: build ## Dry run publish
	npm publish --dry-run

publish: build test ## Publish to npm
	npm publish

check: lint type-check test ## Run all checks (lint, type-check, test)

ci: install check build ## Run CI pipeline
