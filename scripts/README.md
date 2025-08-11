# 🛠️ Repository Scripts

> Automation scripts and utilities for repository management, CI/CD, and development workflows.

## 📋 Table of Contents

- [Overview](#-overview)
- [Scripts](#-scripts)
- [Development](#-development)
- [Testing](#-testing)
- [Architecture](#-architecture)

## 🎯 Overview

This workspace contains all automation scripts and utilities for the repository, including:

- **Version Management**: Automated versioning, changelog generation, and release workflows
- **CI/CD Scripts**: GitHub Actions utilities, branch validation, and staged file checks
- **Development Tools**: DevContainer setup, cleanup utilities, and VS Code configuration
- **Shell Utilities**: Reusable components for git operations, package management, and Docker Compose parsing

## 🚀 Scripts

### Version Management
- `version-ci.ts` - Main CI orchestrator with git authentication (main entry point)
- `version-prepare.ts` - Version bumping and changelog generation
- `version-apply.ts` - Commit, tag, and push operations

### CI/CD
- `ci-act.ts` - Run GitHub Actions locally with `act`
- `ci-attach-affected.ts` - Attach affected packages to GitHub Actions output
- `ci-attach-service-ports.ts` - Attach service port mappings for deployment
- `commit.ts` - Unified commit interface with interactive fallback
- `commit-check.ts` - Comprehensive commit validation with step-based checking
- `commit-staged-check.ts` - Check staged files for manual changes
- `commit-interactive.ts` - Interactive commit creation with validation

### Development
- `dev-check.ts` - Health check for DevContainer services
- `dev-cleanup.ts` - Clean up DevContainer artifacts
- `dev-rm.ts` - Remove VS Code DevContainer (host only)
- `dev-setup.ts` - Setup DevContainer environment

### Local Environment
- `local-cleanup.ts` - Comprehensive cleanup of build artifacts
- `local-setup.ts` - Complete local development setup
- `local-vscode.ts` - Sync VS Code configuration from DevContainer

### Utilities
- `update-package-json.ts` - Update package.json exports automatically
- `example-script.ts` - Template for creating new scripts

## 🧪 Development

### Running Scripts
```bash
# From repository root
bun run scripts/<script-name>.ts [options]

# From scripts directory
bun run <script-name>.ts [options]
```

### Adding New Scripts
1. Create your script following the `example-script.ts` template
2. Use the `createScript` utility for consistent CLI handling
3. Add comprehensive JSDoc comments
4. Include examples in the script configuration

### Code Quality
```bash
# Run type checking
bun run check:types

# Run linting
bun run check:lint

# Fix linting issues
bun run check:fix
```

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run with coverage
bun run test:coverage

# Run specific test file
bun test shell/version-utils.test.ts
```

### Test Coverage
- `shell/version-utils.test.ts` - Core version management utilities
- `shell/changelog-generator.test.ts` - Changelog generation logic

## 🏗️ Architecture

### Core Modules

#### `shell/create-scripts.ts`
- CLI argument parsing and validation
- Consistent error handling and help generation
- Type-safe argument inference

#### `entities/` - Core Entity System
- **EntityCommit** - Commit parsing, validation, and analysis
- **EntityChangelog** - Changelog generation and merging
- **EntityPackageJson** - Package.json operations and version management
- **EntityWorkspace** - Workspace package discovery and validation
- **EntityCompose** - Docker Compose parsing and service health
- **EntityAffected** - Affected package detection with dependencies
- **EntityTag** - Git tag operations and management
- **ChangelogManager** - Stateful changelog orchestration

#### `shell/create-scripts.ts`
- CLI argument parsing and validation
- Consistent error handling and help generation
- Type-safe argument inference

#### `shell/interactive-cli.ts`
- Interactive prompt system for user input
- Selection, confirmation, and text input handling

### Design Principles

1. **Modularity**: Each script has a single responsibility
2. **Type Safety**: Full TypeScript support with strict types
3. **Testability**: Comprehensive test coverage with mocking
4. **Consistency**: Shared utilities and patterns across scripts
5. **Documentation**: Self-documenting code with JSDoc comments

### Dependencies

- **Runtime**: Bun for JavaScript execution and package management
- **Types**: TypeScript for type safety
- **Utilities**: Custom shell utilities for git, Docker, and file operations
- **Testing**: Bun's built-in test runner with mocking support

---

*This workspace is part of the larger monorepo automation system. For more information, see the main repository documentation.*