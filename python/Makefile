# Python SDK Makefile
SHELL := /bin/bash

.PHONY: help install install-dev clean test test-coverage lint format type-check security build docs check pr-ready

## Help
help: ## Show this help message
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "}; /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Dependencies
install: ## Install package in development mode
	pip install -e .

install-dev: ## Install development dependencies
	pip install -e .[dev]
	pip install -r requirements.txt
	pip install black flake8 mypy pylint bandit safety isort pytest-xdist pytest-mock

install-tools: ## Install additional development tools
	pip install black flake8 mypy pylint bandit safety isort pytest-xdist pytest-mock build twine check-manifest

## Cleaning
clean: ## Clean build artifacts and cache
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf htmlcov/
	rm -rf .coverage
	rm -rf coverage.xml
	rm -rf pytest-results.xml
	rm -rf .pytest_cache/
	find . -type d -name __pycache__ -exec rm -rf {} + || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete

## Testing
test: ## Run tests
	pytest -v

test-coverage: ## Run tests with coverage
	pytest -v --cov=goiam --cov-report=term --cov-report=xml --cov-report=html

test-parallel: ## Run tests in parallel
	pytest -v -n auto

test-watch: ## Run tests in watch mode
	pytest-watch -- -v

## Code Quality
format: ## Format code with Black and isort
	black .
	isort .

format-check: ## Check code formatting
	black --check --diff .
	isort --check-only --diff .

lint: ## Run all linters
	flake8 .
	pylint goiam/

lint-flake8: ## Run Flake8 linter
	flake8 .

lint-pylint: ## Run Pylint
	pylint goiam/

type-check: ## Run MyPy type checking
	mypy goiam/ --ignore-missing-imports

## Security
security: ## Run security checks
	bandit -r goiam/
	safety check

security-audit: ## Run comprehensive security audit
	bandit -r goiam/ -f json -o bandit-report.json
	safety check --json --output safety-report.json
	pip-audit --format=json --output=pip-audit.json || echo "pip-audit completed"

## Building and Distribution
build: ## Build package
	python -m build

build-wheel: ## Build wheel only
	python -m build --wheel

build-sdist: ## Build source distribution only
	python -m build --sdist

check-dist: ## Check distribution files
	twine check dist/*

upload-test: ## Upload to test PyPI
	twine upload --repository testpypi dist/*

upload: ## Upload to PyPI
	twine upload dist/*

## Package Management
check-manifest: ## Check package manifest
	check-manifest

validate-package: ## Validate package for PyPI
	python -m build
	twine check dist/*
	pip install dist/*.whl --force-reinstall
	python -c "import goiam; print('Package validation successful')"

## Documentation
docs: ## Generate documentation (placeholder)
	@echo "Documentation generation not implemented yet"

## Comprehensive Checks
check: format-check lint type-check test ## Run all checks (format, lint, type-check, test)

pr-ready: clean install-dev format-check lint type-check test-coverage security build check-dist ## Prepare for pull request
	@echo "✅ All checks passed - ready for PR!"

## Development Utilities
deps-show: ## Show installed packages
	pip list

deps-outdated: ## Show outdated packages
	pip list --outdated

deps-tree: ## Show dependency tree
	pip install pipdeptree
	pipdeptree

info: ## Show project information
	@echo "Project: goiam-python"
	@echo "Python version: $$(python --version)"
	@echo "Pip version: $$(pip --version)"
	@echo "Virtual env: $$(echo $$VIRTUAL_ENV || echo 'Not in virtual environment')"

## Quick Development Commands  
dev-setup: clean install-dev ## Complete development setup
	@echo "✅ Development environment ready!"

quick-test: ## Quick test run (no coverage)
	pytest -x --tb=short

fix: ## Auto-fix formatting and imports
	black .
	isort .
	@echo "✅ Code formatted and imports sorted"
