# 🔧 Development Flows

> **Daily development commands and processes for the Monobun monorepo**

This document covers the essential commands and workflows for day-to-day development. For setup and cleanup, see the [Installation Guide](./1_INSTALLATION_GUIDE.md) and the [Setup Flows](./2_SETUP_FLOWS.md).

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Testing Workflow](#-testing-workflow)
- [Development Commands](#-development-commands)
- [Code Quality](#-code-quality)
- [Build Commands](#-build-commands)
- [DevContainer Management](#-devcontainer-management)
- [Contribution Workflow](#-contribution-workflow)
- [Version Management](#-version-management)

## 🚀 Quick Start

### **Daily Development Flow**
```bash
# 1. Start your development session
bun run dev                    # Start all applications in development mode

# 2. Make your changes and run quality checks
bun run check:quick           # Quick verification of your changes

# 3. Test your changes
bun run test --affected       # Test only affected packages

# 4. Build your changes
bun run build --affected      # Build only affected packages
```

## 🧪 Testing Workflow

### **Test Execution**
```bash
# Run all tests
bun run test                 # Run all tests across all packages

# Run tests for specific packages
turbo run test --filter=@repo/ui        # Test UI package only
turbo run test --filter=@repo/utils     # Test utils package only
turbo run test --filter=admin           # Test admin app only

# Run tests for affected packages only
bun run test --affected      # Test only packages affected by changes
```

### **Test Options**
```bash
# Coverage and reporting
bun run test:coverage        # Run tests with coverage
bun run test:coverage --affected  # Coverage for affected packages only

# Parallel testing
turbo run test --parallel    # Turbo parallel testing
```

### **Test Utilities**
```bash
# Clear test cache
bun run test --clearCache    # Clear test cache
turbo run test --clearCache  # Clear Turbo test cache
```

## 🔧 Development Commands

### **Application Development**

#### **Local Mode (Host Machine)**
```bash
# Start all applications locally
bun run dev                   # Start all apps in development mode

# Start specific applications locally
turbo run dev --filter=admin      # Start admin app only
turbo run dev --filter=storefront # Start storefront app only
turbo run dev --filter=api        # Start API only
```

#### **DevContainer Mode (Containerized)**
```bash
# Start all applications in DevContainer
bun run dev:up               # Start all DevContainer services

# Start specific applications in DevContainer
bun run dev:up admin         # Start admin service only
bun run dev:up storefront    # Start storefront service only
bun run dev:up api           # Start API service only
bun run dev:up ui            # Start UI package with Storybook only
```

#### **Development Options**
```bash
# Health monitoring
bun run dev:health           # Check DevContainer health status
bun run dev:logs             # View DevContainer logs
bun run dev:logs admin       # View specific service logs

# Container management
bun run dev:restart          # Restart all services
bun run dev:down             # Stop all services
bun run dev:cleanup          # Clean up containers and volumes
```

### **Package Development**

#### **UI Package with Storybook**
```bash
# Start Storybook development server
turbo run dev --filter=@repo/ui        # Start UI package dev
bun run build:storybook                # Build Storybook for production

# Storybook commands
cd packages/ui
bun run dev:storybook                  # Start Storybook dev server
bun run start                          # Serve built Storybook
```

#### **Utility Package Development**
```bash
# Work on utility packages
turbo run dev --filter=@repo/utils     # Start utils package dev
turbo run build --filter=@repo/utils   # Build utils package
```

## 🔍 Code Quality

### **Quality Checks**
```bash
# Quick quality check
bun run check:quick          # Run all quality checks on affected packages

# Individual quality checks
bun run check                # Biome linting and formatting
bun run check:fix            # Auto-fix Biome issues
bun run check:types          # TypeScript type checking
bun run check:staged         # Check staged files for issues
```

### **Staged File Validation**
```bash
# Check staged files for common issues
bun run check:staged         # Validate staged files

# Common validations:
# - No manual version changes in package.json
# - No manual CHANGELOG.md entries
# - No development files committed
```

### **Git Hooks**
```bash
# Pre-commit hooks (automatic)
# - Staged file validation
# - Code formatting
# - Type checking

# Pre-push hooks (automatic)
# - Branch name validation
# - Quality checks
# - Tests
# - Build verification
```

## 🏗️ Build Commands

### **Build System**
```bash
# Build all packages
bun run build               # Build all packages and applications

# Build specific packages
turbo run build --filter=@repo/ui        # Build UI package
turbo run build --filter=@repo/utils     # Build utils package
turbo run build --filter=admin           # Build admin app

# Build affected packages only
bun run build --affected     # Build only affected packages
```

### **Storybook Build**
```bash
# Build Storybook for production
bun run build:storybook      # Build all Storybook instances
turbo run build:storybook --filter=@repo/ui  # Build UI Storybook
```

### **Start Production Builds**
```bash
# Start production builds
bun run start               # Start all production builds
turbo run start --filter=admin           # Start admin app
turbo run start --filter=storefront      # Start storefront app
turbo run start --filter=api             # Start API server
```

## 🐳 DevContainer Management

### **Container Health**
```bash
# Health monitoring
bun run dev:check            # Comprehensive DevContainer health check
bun run dev:health           # Quick container status overview

# Health check includes:
# - Container status verification
# - Port availability
# - Service connectivity
# - Volume mount verification
```

### **Container Operations**
```bash
# Container lifecycle
bun run dev:setup            # Setup DevContainer environment
bun run dev:up               # Start all containers
bun run dev:down             # Stop all containers
bun run dev:restart          # Restart all containers

# Container maintenance
bun run dev:cleanup          # Clean containers and volumes
bun run dev:rm               # Remove containers completely
bun run dev:build            # Rebuild containers
```

### **Service-Specific Operations**
```bash
# Individual service management
bun run dev:up admin         # Start admin service only
bun run dev:up storefront    # Start storefront service only
bun run dev:up api           # Start API service only
bun run dev:up ui            # Start UI service only

# Service logs
bun run dev:logs admin       # View admin service logs
bun run dev:logs storefront  # View storefront service logs
bun run dev:logs api         # View API service logs
```

## 📝 Contribution Workflow

### **Development Process**
```bash
# 1. Setup development environment
bun run local:setup          # Setup local environment
bun run dev:setup            # Setup DevContainer (optional)

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes and test
# ... make your changes ...
bun run check:quick          # Verify changes
bun run test --affected      # Test affected packages

# 4. Commit with conventional commits
git add .
git commit -m "feat(scope): description of changes"

# 5. Push and create PR
git push origin feature/your-feature
```

### **Conventional Commits**
```bash
# Commit format: type(scope): description
git commit -m "feat(admin): add user management interface"
git commit -m "fix(ui): resolve button styling issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(utils): optimize string processing"

# Available scopes (auto-generated):
# - root, admin, storefront, api, @repo/ui, @repo/utils, @repo/typescript-config, @repo/test-preset
```

### **Quality Gates**
```bash
# Pre-commit (automatic)
# - Code formatting (Biome)
# - Type checking
# - Staged file validation

# Pre-push (automatic)
# - Branch name validation
# - Quality checks
# - Test execution
# - Build verification
```

## 🔄 Version Management

### **Automated Versioning**
```bash
# Add changeset for versioning
bun run version:add          # Interactive changeset creation

# Commit version changes
bun run version:commit       # Apply version changes and create release

# Version workflow includes:
# - Dynamic scope detection
# - Automated changelog generation
# - Package version updates
# - Git tag creation
```

### **Version Scripts**
```bash
# Version management scripts
bun run scripts/version-commit.ts  # Manual version commit
bun run scripts/ci-staged.ts       # Staged file validation
bun run scripts/ci-check.ts        # CI environment validation
```

## 🚨 Troubleshooting

### **Common Issues**

#### **DevContainer Issues**
```bash
# Container won't start
bun run dev:cleanup          # Clean up containers
bun run dev:build            # Rebuild containers
bun run dev:check            # Check container health

# Port conflicts
bun run dev:health           # Check port usage
# Manually change ports in docker-compose.dev.yml
```

#### **Build Issues**
```bash
# Build failures
bun run check:types          # Check for type errors
bun run check:fix            # Fix formatting issues
bun run test                 # Run tests to identify issues

# Cache issues
turbo run build --clearCache # Clear build cache
bun run test --clearCache    # Clear test cache
```

#### **Test Issues**
```bash
# Test failures
bun run test --affected      # Run tests on affected packages
bun run test --clearCache    # Clear test cache
turbo run test --filter=@repo/test-preset  # Test test preset package
```

### **Debug Commands**
```bash
# Debug development environment
bun run dev:check            # Comprehensive health check
bun run check:quick          # Quick quality verification
bun run test                 # Full test suite

# Debug specific areas
bun run check:types          # TypeScript issues
bun run check:staged         # Staged file issues
bun run dev:health           # Container issues
```

## 📊 Performance Optimization

### **Development Performance**
```bash
# Fast development workflow
bun run check:quick          # Quick quality check (~30s)
bun run test --affected      # Test only affected packages (~20s)
bun run build --affected     # Build only affected packages (~30s)

# Parallel operations
turbo run test --parallel    # Parallel test execution
turbo run build --parallel   # Parallel build execution
```

### **Caching Strategy**
```bash
# Turbo caching
turbo run build              # Uses Turbo cache for faster builds
turbo run test               # Uses Turbo cache for faster tests

# Cache management
turbo run build --clearCache # Clear build cache
turbo run test --clearCache  # Clear test cache
```

---

**Ready to start developing?** Follow this workflow for efficient, quality-focused development in the Monobun monorepo! 🚀 