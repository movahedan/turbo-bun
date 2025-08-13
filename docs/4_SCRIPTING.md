# 🐚 Scripting Guide

> **Comprehensive scripting system for the Monobun monorepo with Bun shell runtime and interactive CLI**

## 📋 Table of Contents

- [Overview](#-overview)
- [Script Architecture](#-script-architecture)
- [Enhanced Interactive CLI](#-enhanced-interactive-cli)
- [Entity System](#-entity-system)
- [Script Development](#-script-development)
- [Available Scripts](#-available-scripts)
- [Testing Scripts](#-testing-scripts)

## 🎯 Overview

The Monobun monorepo features a sophisticated scripting system built on Bun's shell runtime that provides:

- **🎯 Interactive CLI**: Step-by-step wizards with navigation and validation
- **🏗️ Entity Architecture**: Modular, reusable components for common operations
- **🔧 Type Safety**: Full TypeScript support with strict validation
- **🧪 Testing**: Comprehensive test coverage with mocking support
- **📚 Documentation**: Self-documenting code with JSDoc comments

## 🏗️ Script Architecture

### Core Components

```
📁 scripts/
├── shell/                    # 🎮 CLI and interaction utilities
│   ├── create-scripts.ts     # Script creation framework
│   ├── interactive-cli.ts    # Interactive prompt system
│   ├── colorify.ts          # Terminal color utilities
│   └── cli-tools.ts         # CLI navigation and state management
├── entities/                 # 🏛️ Core business logic
│   ├── commit.ts            # Commit parsing and validation
│   ├── changelog.ts         # Changelog generation
│   ├── package-json.ts      # Package.json operations
│   ├── workspace.ts         # Workspace management
│   ├── compose.ts           # Docker Compose parsing
│   ├── affected.ts          # Affected package detection
│   ├── tag.ts               # Git tag operations
│   └── changelog-manager.ts # Changelog orchestration
└── *.ts                     # 🚀 Individual script implementations
```

### Design Principles

1. **Modularity**: Each script has a single responsibility
2. **Type Safety**: Full TypeScript support with strict types
3. **Testability**: Comprehensive test coverage with mocking
4. **Consistency**: Shared utilities and patterns across scripts
5. **Documentation**: Self-documenting code with JSDoc comments

## 🎮 Enhanced Interactive CLI

The new interactive CLI system provides sophisticated user experience with:

### ✨ Features

- **🎯 Step-by-Step Wizard**: Guided workflows with validation
- **📊 Progress Tracking**: Visual progress bars and completion status
- **⚡ Quick Actions**: Keyboard shortcuts for common operations
- **🔄 Smart Navigation**: Go back/forward between steps with arrow keys
- **🚫 Conditional Skipping**: Automatically skip irrelevant steps
- **📋 Preview Mode**: See final results before confirming
- **❌ Validation**: Real-time validation with helpful error messages

### 🎮 Usage Examples

```bash
# Interactive commit creation
bun run commit

# Direct message commit
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
- **p**: Preview final result
- **←**: Go back to previous step

## 🏛️ Entity System

The entity system provides reusable, type-safe components for common operations:

### Core Entities

#### `EntityCommit`
- Commit parsing, validation, and analysis
- Conventional commit format support
- PR categorization and metadata extraction
- Enhanced PR commit detection 🆕

#### `EntityChangelog`
- Changelog generation and merging
- Keep a Changelog format compliance
- Version-aware content management
- PR commit grouping and organization 🆕

#### `EntityPackageJson`
- Package.json operations and version management
- Automated version bumping
- Changelog file management

#### `EntityWorkspace`
- Workspace package discovery and validation
- Package path resolution
- Dependency graph analysis

#### `EntityCompose`
- Docker Compose parsing and service health
- Service port mapping
- Health check monitoring

#### `EntityAffected`
- Affected package detection with dependencies
- Change impact analysis
- CI/CD integration support

#### `EntityTag`
- Git tag operations and management
- Version tag creation and deletion
- Remote tag synchronization

#### `ChangelogManager`
- Stateful changelog orchestration
- Version bump determination
- Commit range analysis
- Enhanced PR commit processing 🆕

#### `EntityPr` 🆕
- PR commit extraction and analysis
- Support for both regular and squash merges
- Individual commit grouping with PRs
- Enhanced changelog generation

## 🔧 Script Development

### Creating New Scripts

1. **Use the Template**: Follow `example-script.ts` structure
2. **Use `createScript` Utility**: Ensures consistent CLI handling
3. **Add JSDoc Comments**: Document purpose and usage
4. **Include Examples**: Provide practical usage examples

### Script Configuration

```typescript
const scriptConfig = {
  name: "Script Name",
  description: "What this script does",
  usage: "bun run script-name [options]",
  examples: [
    "bun run script-name",
    "bun run script-name --option value"
  ],
  options: [
    {
      short: "-o",
      long: "--option",
      description: "Option description",
      required: true,
      validator: validators.nonEmpty
    }
  ]
} as const satisfies ScriptConfig;
```

### Code Quality

```bash
# Run type checking
bun run check:types

# Run linting
bun run check:fix

# Run tests
bun test scripts/
```

## 🚀 Available Scripts

### Development Scripts

- **`dev-setup`**: Set up development environment
- **`dev-cleanup`**: Clean up development resources
- **`dev-check`**: Verify DevContainer health
- **`local-setup`**: Local environment setup
- **`local-cleanup`**: Local environment cleanup
- **`local-vscode`**: VS Code-specific setup

### CI/CD Scripts

- **`ci-act`**: Test GitHub Actions locally
- **`ci-attach-affected`**: Attach affected packages to GitHub output
- **`ci-attach-service-ports`**: Attach service ports to GitHub output

### Version Management

- **`version-prepare`**: Prepare version bumps and changelogs
- **`version-apply`**: Apply version changes and create tags
- **`version-ci`**: Complete CI version workflow

### Git Operations

- **`commit`**: Interactive commit creation with validation
- **`commit-check`**: Comprehensive commit validation
- **`update-package-json`**: Update package.json exports

## 🧪 Testing Scripts

### Test Coverage

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage

# Run specific test file
bun test shell/version-utils.test.ts
```

### Test Structure

- **`shell/version-utils.test.ts`**: Core version management utilities
- **`shell/changelog-generator.test.ts`**: Changelog generation logic
- **`entities/*.test.ts`**: Entity system tests

### Testing Utilities

```typescript
// Create mock data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

// Test script execution
describe('Script Name', () => {
  it('should execute successfully', async () => {
    const result = await scriptFunction();
    expect(result).toBeDefined();
  });
});
```

## 🔗 Dependencies

- **Runtime**: Bun for JavaScript execution and package management
- **Types**: TypeScript for type safety
- **Utilities**: Custom shell utilities for git, Docker, and file operations
- **Testing**: Bun's built-in test runner with mocking support

---

*This scripting system provides a robust foundation for automation, CI/CD, and development workflows. For more information, see the individual script files and the main project documentation.* 