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
- `version.ts` - Complete version flow orchestrator (main entry point)
- `version-bump.ts` - Bump package versions based on commit analysis
- `version-changelog.ts` - Generate changelogs from git commits
- `version-commit.ts` - Commit version changes with proper formatting
- `version-tag.ts` - Create and manage git tags for releases

### CI/CD
- `ci-attach-affected.ts` - Attach affected packages to GitHub Actions output
- `ci-attach-service-ports.ts` - Attach service port mappings for deployment
- `ci-check.ts` - Run GitHub Actions locally with `act`
- `commit-check.ts` - Validate commit messages and branch names
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

#### `shell/repo-utils.ts`
- Package.json management (`PackageJsonUtils`)
- Workspace operations (`WorkspaceUtils`)
- Affected package detection (`AffectedUtils`)
- Git tag operations (`TagsUtils`)
- Docker Compose parsing (`ComposeUtils`)

#### `shell/version-utils.ts`
- Git commit analysis and parsing
- Semantic version management
- Changelog content merging and sorting
- PR categorization and statistics
- Conventional commit parsing

#### `shell/changelog-generator.ts`
- Markdown changelog generation with Keep a Changelog format
- Badge and link formatting for PRs and commits
- Collapsible section creation for better organization
- Author information handling with email integration
- PR categorization and commit type analysis

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