# 🤖 AI Assistant Guide

> **Comprehensive guide for AI assistants working with the Monobun monorepo**

## 📋 Table of Contents

- [Overview](#-overview)
- [Project Architecture](#-project-architecture)
- [Enhanced Script System](#-enhanced-script-system)
- [Development Workflows](#-development-workflows)
- [Code Standards](#-code-standards)
- [Common Tasks](#-common-tasks)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

The Monobun monorepo is a sophisticated development environment built on modern technologies with enhanced automation and interactive CLI systems. This guide helps AI assistants understand the project structure, workflows, and best practices.

### **Key Technologies**

- **🏗️ Monorepo**: Turborepo for build system orchestration
- **⚡ Runtime**: Bun for JavaScript execution and package management
- **🔷 Language**: TypeScript with strict type safety
- **🎨 Styling**: Tailwind CSS with CSS Modules
- **🐳 Containers**: Docker and DevContainer for development
- **🚀 CI/CD**: GitHub Actions with automated workflows

## 🏗️ Project Architecture

### **Repository Structure**

```
turbo/
├── apps/                    # 🚀 Application packages
│   ├── admin/              # React + Vite admin dashboard
│   ├── storefront/         # Next.js e-commerce frontend
│   ├── api/                # Express.js backend API
│   └── docs-astro/         # Astro documentation site
├── packages/                # 📦 Shared packages
│   ├── ui/                 # React component library
│   ├── utils/              # Utility functions
│   ├── typescript-config/  # TypeScript configurations
│   └── test-preset/        # Testing configurations
├── scripts/                 # 🐚 Automation scripts
│   ├── entities/           # Core business logic
│   ├── shell/              # CLI and interaction utilities
│   └── *.ts                # Individual script implementations
└── docs/                    # 📚 Project documentation
```

### **Package Management**

- **Root**: `package.json` with workspace definitions
- **Workspaces**: `apps/*` and `packages/*` as separate packages
- **Dependencies**: Bun for fast package management
- **Scripts**: Centralized script management with `bun run`

## 🎮 Enhanced Script System

### **Interactive CLI Features**

The project features a sophisticated interactive CLI system:

#### **Step-by-Step Wizards**
- Guided workflows with validation
- Progress tracking and completion status
- Smart navigation between steps
- Conditional step skipping

#### **Quick Actions**
- Keyboard shortcuts for common operations
- Context-aware help and preview
- Real-time validation feedback
- Error handling and recovery

### **Entity-Based Architecture**

The script system uses modular, reusable components:

```
📁 scripts/entities/
├── commit.ts            # 📝 Commit parsing and validation
├── changelog.ts         # 📋 Changelog generation
├── package-json.ts      # 📦 Package.json operations
├── workspace.ts         # 🗂️ Workspace package discovery
├── compose.ts           # 🐳 Docker Compose parsing
├── affected.ts          # 🔍 Affected package detection
├── tag.ts               # 🏷️ Git tag operations
└── changelog-manager.ts # 🎯 Changelog orchestration
```

### **Available Scripts**

```bash
# Development
bun run dev:setup        # Setup DevContainer
bun run dev:up           # Start services
bun run dev:check        # Check service health
bun run local:setup      # Setup local environment

# Quality Assurance
bun run check            # Full quality check
bun run check:quick      # Quick quality check
bun run check:fix        # Fix linting issues
bun run check:types      # Type checking

# Version Management
bun run version:commit   # Interactive versioning
bun run version:prepare  # Prepare versions
bun run version:apply    # Apply versions

# Git Operations
bun run commit           # Interactive commit creation
bun run commit:check     # Commit validation
```

## 🔧 Development Workflows

### **1. Local Development**

```bash
# Setup local environment
bun run local:setup

# Install dependencies
bun install

# Start development
bun run dev

# Quality checks
bun run check:quick
```

### **2. DevContainer Development**

```bash
# Setup DevContainer
bun run dev:setup

# Start services
bun run dev:up

# Verify health
bun run dev:check

# View logs
bun run dev:logs
```

### **3. Package Development**

```bash
# Work on specific package
cd packages/my-package

# Install dependencies
bun install

# Run tests
bun test

# Build package
bun run build
```

### **4. Version Management**

```bash
# Interactive versioning
bun run version:commit

# Preview changes
bun run version:commit --dry-run

# Manual operations
bun run scripts/version-prepare.ts --package root
bun run scripts/version-apply.ts
```

### **5. Changelog Generation** 🆕

The changelog system now properly handles individual commits from PRs:

```bash
# Generate changelog for specific range
bun run scripts/version-prepare.ts --package root --from v0.0.2 --to HEAD

# Features:
# - Automatically detects PR commits vs merge commits
# - Groups individual commits with their PR sections
# - Handles both regular merges and squash merges
# - Properly categorizes commits by type (feat, fix, etc.)

## 📋 Code Standards

### **TypeScript Standards**

- **Strict Mode**: Use strict TypeScript configuration
- **Type Safety**: Prefer explicit types over `any`
- **Interfaces**: Use interfaces for object shapes
- **Generics**: Use generics for reusable components
- **Return Types**: Declare return types for functions

### **React Standards**

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define clear props interfaces
- **Custom Hooks**: Extract reusable logic into custom hooks
- **CSS Modules**: Use CSS Modules with Tailwind `@apply`

### **Script Standards**

- **createScript**: Use `createScript` utility for all scripts
- **Validation**: Include proper argument validation
- **Error Handling**: Use try-catch with proper error messages
- **Documentation**: Include JSDoc comments for complex logic

### **Naming Conventions**

- **Files**: Use kebab-case for file names
- **Variables**: Use camelCase for variables and functions
- **Types**: Use PascalCase for types and interfaces
- **Constants**: Use UPPER_SNAKE_CASE for constants

## 🚀 Common Tasks

### **Adding New Packages**

```bash
# Create package directory
mkdir packages/my-package
cd packages/my-package

# Initialize package
bun init

# Add to workspace
# Update root package.json workspaces array

# Install dependencies
bun install

# Add to Turbo configuration
# Update turbo.json
```

### **Adding New Scripts**

```bash
# Create script file
touch scripts/my-script.ts

# Use createScript utility
import { createScript, type ScriptConfig } from "./shell/create-scripts";

const scriptConfig = {
  name: "My Script",
  description: "What this script does",
  usage: "bun run my-script [options]",
  examples: ["bun run my-script"],
  options: []
} as const satisfies ScriptConfig;

export const myScript = createScript(scriptConfig, async function main(args, xConsole) {
  // Script logic here
});

if (import.meta.main) {
  myScript();
}
```

### **Adding New Entities**

```bash
# Create entity file
touch scripts/entities/my-entity.ts

# Follow entity pattern
export class EntityMyEntity {
  constructor() {}

  static async methodName(): Promise<void> {
    // Implementation
  }
}

# Export from index
export { EntityMyEntity } from "./my-entity";
```

### **Testing Scripts**

```bash
# Run all tests
bun test

# Run specific test
bun test scripts/my-script.test.ts

# Run with coverage
bun test --coverage

# Run in watch mode
bun test --watch
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Script Execution Problems**
```bash
# Check script permissions
chmod +x scripts/*.ts

# Verify Bun installation
bun --version

# Check script syntax
bun run check:types
```

#### **DevContainer Issues**
```bash
# Reset DevContainer
bun run dev:cleanup
bun run dev:setup

# Check service health
bun run dev:check

# View logs
bun run dev:logs
```

#### **Quality Check Failures**
```bash
# Fix linting issues
bun run check:fix

# Check types
bun run check:types

# Run tests
bun test
```

### **Debug Mode**

```bash
# Enable verbose output
bun run dev:setup --verbose

# Dry run to preview changes
bun run version:commit --dry-run

# Check affected packages
bun run scripts/ci-attach-affected.ts --mode turbo
```

## 📚 Best Practices

### **1. Development Workflow**

- Use DevContainer for consistent environments
- Run quality checks before committing
- Test changes locally before pushing
- Use interactive CLI for complex operations

### **2. Code Quality**

- Follow TypeScript strict standards
- Use proper error handling
- Include comprehensive tests
- Document complex logic

### **3. Script Development**

- Use `createScript` utility consistently
- Include proper validation
- Handle errors gracefully
- Provide helpful error messages

### **4. Package Management**

- Keep dependencies up to date
- Use exact versions for stability
- Test package compatibility
- Document breaking changes

---

*This enhanced development system provides a robust, automated approach to development workflows with sophisticated CLI interaction and comprehensive CI/CD integration. AI assistants should follow these guidelines to provide accurate and helpful assistance.*
