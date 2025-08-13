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

This directory contains various utility scripts for development, CI/CD, and project management.

## 📝 Enhanced Interactive Commit CLI

The commit script now features a sophisticated interactive wizard for creating conventional commits with enhanced navigation and state management.

### ✨ Features

- **🎯 Step-by-Step Wizard**: Guided commit message creation with validation
- **📊 Progress Tracking**: Visual progress bar showing completion status
- **⚡ Quick Actions**: Keyboard shortcuts for common operations
- **🔄 Smart Navigation**: Go back/forward between steps with arrow keys
- **🚫 Conditional Skipping**: Automatically skip irrelevant steps
- **📋 Commit Preview**: See final commit message before confirming
- **❌ Validation**: Real-time validation with helpful error messages

### 🎮 Usage

```bash
# Run interactive mode
bun run commit

# Use direct message
bun run commit -m "feat: add new feature"

# Stage all files and commit
bun run commit -a -m "fix: resolve bug"

# Skip git hooks
bun run commit -m "docs: update readme" --no-verify
```

### ⌨️ Keyboard Shortcuts

- **↑/↓**: Navigate between options
- **←**: Go back to previous step
- **→**: Go to next step (if validation passes)
- **Enter**: Confirm selection/input
- **Space**: Toggle multi-select options
- **ESC**: Clear input or go back
- **Ctrl+C**: Exit wizard

### ⚡ Quick Actions

Each step shows available quick actions:

- **h**: Show help for current step
- **s**: Skip current step (if allowed)
- **p**: Preview final commit message
- **←**: Go back to previous step

### 🔄 Step Flow

1. **Type Selection**: Choose commit type (feat, fix, docs, etc.)
2. **Scope Selection**: Select affected areas (optional)
3. **Description**: Write short description
4. **Body Lines**: Add detailed explanation (optional)
5. **Breaking Change**: Specify if breaking (if type supports it)
6. **Confirmation**: Review and confirm final message

### 🎨 Customization

The CLI automatically adapts based on your choices:
- Skips body lines if description is too short
- Skips breaking change if type doesn't support it
- Makes scopes optional
- Validates input in real-time

### 🧪 Testing

Test the enhanced CLI:

```bash
# Test interactive mode
bun run commit

# Test with staged changes
git add .
bun run commit
```

## 🔧 Other Scripts

- **`dev-setup`**: Set up development environment
- **`dev-cleanup`**: Clean up development resources
- **`local-setup`**: Local environment setup
- **`local-cleanup`**: Local environment cleanup
- **`local-vscode`**: VSCode-specific setup
- **`ci-*`**: CI/CD related scripts
- **`version-*`**: Version management scripts

## 📚 Documentation

For detailed information about each script, see the individual script files and the main project documentation in the `docs/` directory.

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