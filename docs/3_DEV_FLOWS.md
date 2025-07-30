# 🔄 Development Workflow

> **Daily development commands and processes for the Turboobun monorepo**

This document covers the essential commands and workflows for day-to-day development. For setup and cleanup, see the [Installation Guide](./1_INSTALLATION_GUIDE.md) and the [Setup Flows](./2_SETUP_FLOWS.md).

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Testing Workflow](#-testing-workflow)
- [Development Commands](#-development-commands)
- [Code Quality](#-code-quality)
- [Build Commands](#-build-commands)
- [DevContainer Management](#-devcontainer-management)
- [Contribution Workflow](#-contribution-workflow)

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
# Watch mode for development
bun run test:watch           # Run tests in watch mode
turbo run test --filter=@repo/ui --watch  # Watch specific package

# Coverage and reporting
bun run test:coverage        # Run tests with coverage
bun run test:coverage --affected  # Coverage for affected packages only

# Parallel testing
bun run test:parallel        # Run tests in parallel
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
# Start with specific options
bun run dev --parallel        # Start all apps in parallel
turbo run dev --filter=@repo/* --parallel # Start all packages in parallel

# DevContainer options
bun run dev:up                # It's in parallel by default
bun run dev:up  # Start all services
```

### **Package Development**

#### **Local Mode (Host Machine)**
```bash
# Work on specific packages locally
turbo run dev --filter=@repo/ui         # Start UI package development with Storybook
turbo run dev --filter=@repo/utils      # Start utils package development
turbo run dev --filter=@repo/logger     # Start logger package development

# Build packages for development
turbo run build --filter=@repo/ui       # Build UI package
turbo run build --filter=@repo/utils    # Build utils package
```

#### **DevContainer Mode (Containerized)**
```bash
# We don't have a DevContainer mode for package development, do it on host level
# Unless the package is a docker container, which would follow app development flow
```

### **Development Tools**

#### **Local Mode (Host Machine)**
```bash
# Local health checks
bun run check:quick          # Quick verification of changes
```

#### **DevContainer Mode (Containerized)**
```bash
# Health checks
bun run dev:check             # Check DevContainer health
bun run dev:health            # Check service health status with formatted output

# Service monitoring
bun run dev:logs              # View service logs
bun run dev:logs -f           # Follow logs in real-time
```

## 🔍 Code Quality

### **Code Quality Checks**

#### **Local Mode and DevContainer Mode (Host Machine and Containerized)**
```bash
# Run all quality checks locally
bun run check                 # Check code quality (linting, formatting)
bun run check:fix             # Fix code quality issues automatically
bun run check:types           # Run TypeScript type checking

# Quick quality check for affected files
bun run check:quick           # Quick verification (lint, type, test, build)
```

## 🏗️ Build Commands

### **Build Applications**

#### **Local Mode (Host Machine)**
```bash
# Build all applications locally
bun run build                # Build all packages and applications

# Build specific applications locally
turbo run build --filter=admin      # Build admin app
turbo run build --filter=storefront # Build storefront app
turbo run build --filter=api        # Build API

# Build affected packages only
bun run build --affected     # Build only affected packages
```

#### **DevContainer Mode (Containerized)**
```bash
# Build all applications in DevContainer
bun run dev:build            # Build all DevContainer images

# Build specific applications in DevContainer
bun run dev:build admin      # Build admin service image
bun run dev:build storefront # Build storefront service image
bun run dev:build api        # Build API service image
```

### **Build Options**

#### **Local Mode (Host Machine)**
```bash
# Production builds
NODE_ENV=production bun run build        # Production build
NODE_ENV=production turbo run build      # Production build with Turbo

# Development builds
NODE_ENV=development bun run build       # Development build
NODE_ENV=development turbo run build     # Development build with Turbo

# Build with specific options
turbo run build --filter=@repo/* --force # Force rebuild all packages
turbo run build --filter=@repo/* --parallel # Parallel build
```

#### **DevContainer Mode (Containerized)**
```bash
# DevContainer build options
bun run dev:build                        # Single docker image for the entire dev env
```

### **Build Utilities**

#### **Local Mode (Host Machine)**
```bash
# Build analysis
turbo run build --dry-run    # Show what would be built without building
turbo run build --graph      # Show build dependency graph
```

#### **DevContainer Mode (Containerized)**
```bash
# DevContainer build utilities
bun run dev:build --dry-run  # Show what would be built
bun run dev:build --verbose  # Verbose build output
```

## 🐳 DevContainer Management

### **Service Management**
```bash
# Start and stop services
bun run dev:up               # Start all DevContainer services
bun run dev:down             # Stop all DevContainer services

# Start specific services
bun run dev:up admin         # Start admin service only
bun run dev:up storefront    # Start storefront service only
bun run dev:up api           # Start API service only
```

### **Service Monitoring**
```bash
# Check service status
bun run dev:health           # Check health of all services with formatted output
bun run dev:health admin     # Check health of specific service

# View service logs
bun run dev:logs             # View logs from all services
bun run dev:logs admin       # View logs from specific service
bun run dev:logs -f admin    # Follow logs in real-time
```

### **Service Building**
```bash
# Build services
bun run dev:build            # Build all DevContainer images
bun run dev:build admin      # Build specific service image (Actually it's the same image for all)
bun run dev:build --no-cache # Build without cache
```

### **Service Restart**
```bash
# Restart services
bun run dev:restart          # Restart all DevContainer services
bun run dev:restart admin    # Restart specific service
```

## 🤝 Contribution Workflow

### **Pre-commit Checks**
```bash
# Run all checks before committing
bun run check:quick          # Quick verification (lint, type, test, build)

# Individual checks
bun run check                # Code quality check
bun run check:types          # Type checking
bun run test --affected      # Test affected packages
```

### **Branch Management**
```bash
# Check branch naming
bun run ci:branchname        # Validate branch name (runs automatically on push)

# Create feature branch
git checkout -b feature/your-feature-name
git checkout -b bugfix/your-bugfix-name
git checkout -b hotfix/your-hotfix-name
```

### **Commit Guidelines**

#### **Conventional Commits**
Use VS Code's command palette for conventional commits:
1. **Open Command Palette**: `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. **Type**: "Conventional Commits: Create Commit"
3. **Select commit type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
4. **Enter scope**: `repo`, `admin`, `storefront`, `api`, `ui`
5. **Write description**: Clear, concise description of changes

#### **Manual Commits**
```bash
# Commit with conventional format
git commit -m "feat(admin): add user authentication"

# Commit with body
git commit -m "feat(api): implement user endpoints

- Add GET /api/users endpoint
- Add POST /api/users endpoint
- Add user validation middleware"

# Commit with breaking change
git commit -m "feat(ui): redesign component API

BREAKING CHANGE: Component props have been restructured"
```

### **Pull Request Process**
1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Implement your feature or fix
3. **Run checks**: `bun run check:quick`
4. **Commit changes**: Use conventional commit format
5. **Push branch**: `git push origin feature/your-feature`
6. **Create PR**: Submit pull request with clear description
7. **Ensure CI passes**: All checks must pass before merge

### **Code Review Checklist**
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact is considered
- [ ] Security implications are reviewed

## 🎯 Turbo Commands

### **Filtered Operations**
```bash
# Work with specific packages
turbo run dev --filter=@repo/ui          # Start UI package
turbo run build --filter=@repo/utils     # Build utils package
turbo run test --filter=@repo/logger     # Test logger package
turbo run check:types --filter=@repo/*   # Type check all packages
```

### **Affected Operations**
```bash
# Work only with affected packages
turbo run build --affected               # Build affected packages
turbo run test --affected                # Test affected packages
turbo run check:types --affected         # Type check affected packages
turbo run dev --affected                 # Start affected packages
```

### **Parallel Operations**
```bash
# Run operations in parallel
turbo run build --parallel               # Parallel build
turbo run test --parallel                # Parallel testing
turbo run check:types --parallel         # Parallel type checking
```

## 🔒 Lockfile Configuration

### **JSON Lockfile Format**
This project uses JSON lockfiles (`bun.lock`) instead of binary lockfiles (`bun.lockb`) for better compatibility with tools like Turbo and Docker builds.

#### **Configuration**
```toml
# bunfig.toml
[install]
saveTextLockfile = true  # Always generate JSON lockfiles
```

#### **Why JSON Lockfiles?**
- **Turbo Compatibility**: Turbo can parse JSON lockfiles for `turbo prune` operations
- **Docker Builds**: Docker builds work reliably with JSON format
- **Git Diffing**: JSON lockfiles are human-readable and diffable
- **CI/CD Pipelines**: Better compatibility with various CI/CD tools

#### **Lockfile Management**
```bash
# Install dependencies (generates bun.lock)
bun install

# Update dependencies
bun update

# Force regenerate lockfile
rm bun.lock && bun install

# Check lockfile format
file bun.lock  # Should show "JSON text"
```

#### **Docker Build Integration**
The JSON lockfile format ensures that `turbo prune` commands in Docker builds work correctly:
```dockerfile
# Dockerfile
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=api --docker
```

## 📚 Related Documentation

- [Installation Guide](./1_INSTALLATION_GUIDE.md) - Setup and cleanup procedures
- [Setup Flows](./2_SETUP_FLOWS.md) - Advanced setup configuration
- [Cursor Rules](./.cursor/rules/) - Development conventions and coding standards
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Testing and validation procedures

---

**💡 Pro Tip**: Use `turbo run --help` to see all available Turbo commands and options for your specific workspace. 