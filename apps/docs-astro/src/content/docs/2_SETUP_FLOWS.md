# 🔧 In-Depth Setup Flows

> **Advanced technical details and workflows for development environment setup**

This document provides detailed technical information about the setup flows, configuration options, and advanced usage patterns. For basic installation, see the [Installation Guide](./1_INSTALLATION_GUIDE.md).

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Environment Configuration Strategy](#-environment-configuration-strategy)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture Overview

### **Setup Flow Architecture**

The project implements a layered setup architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Environment                  │
├─────────────────────────────────────────────────────────────┤
│  🔧 Local Development Layer (Required)                      │
│  ├── Dependencies (bun install)                             │
│  ├── Code Quality (biome, typescript)                       │
│  ├── Testing (bun test, turbo)                              │
│  └── Build System (turbo, vite)                             │
├─────────────────────────────────────────────────────────────┤
│  🐳 DevContainer Layer (Optional)                           │
│  ├── Docker Services (admin, storefront, api, ui)          │
│  ├── Development Tools (act, docker-compose)                │
│  └── Health Monitoring & Logging                            │
├─────────────────────────────────────────────────────────────┤
│  🎯 CI/CD Layer (Optional)                                  │
│  ├── GitHub Actions Testing (act)                           │
│  ├── Branch Validation (commitlint)                         │
│  └── Quality Gates (sonarqube)                              │
└─────────────────────────────────────────────────────────────┘
```

### **Command Hierarchy**

```bash
# Core Setup Commands
bun run local:setup      # Foundation layer (always required - from host)
# Go to the DevContainer and `bun run local:setup` again (;
bun run dev:setup        # Container layer (optional)

# Development Commands
bun run dev:up --build <app-name>
bun run dev:logs <app-name>
bun run dev:health <app-name>

# Verification Commands
bun run check:quick      # Quick verification
bun run dev:check        # Health verification
bun run ci:check         # CI layer (optional)

# Cleanup Commands
bun run dev:cleanup      # Container cleanup
bun run local:cleanup    # Complete cleanup
bun run dev:rm          # Container removal (from host)
```

#### **Performance Characteristics**
- **Dependency Installation**: ~5-10 seconds
- **Code Quality Checks**: ~10-20 seconds
- **Test Execution**: ~20-40 seconds
- **Build Process**: ~30-60 seconds
- **Total Runtime**: ~2-3 minutes (cold), ~1 minute (warm)

## 🔧 Environment Configuration Strategy

### **Docker Compose Environment Management**

**Root Environment Files**: Docker Compose uses root-level environment files with passed arguments:

```yaml
# docker-compose.yml (Production)
services:
  prod-admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "5001:80"
    environment:
      - VITE_API_URL=http://api:5003
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]

# .devcontainer/docker-compose.dev.yml (Development)
services:
  admin:
    extends:
      service: apps
    ports:
      - "3001:3001"
    environment:
      PORT: "3001"
      HOST: "0.0.0.0"
      NODE_ENV: "development"
    command: bun run dev --filter=admin -- --host 0.0.0.0 --port 3001
```

**Key Configuration Points**:
- **Root `.env` file**: Used by Docker Compose for shared environment variables
- **Service-specific environment**: Each service defines its own PORT and HOST
- **HOST must be `0.0.0.0`**: Ensures container accessibility
- **PORT must be unique**: Prevents conflicts between services

### **Local Development Environment**

**Package-Level Environment Files**: Local development uses package-specific environment files:

```bash
# Local development structure
apps/admin/.env          # Admin app environment variables
apps/storefront/.env     # Storefront app environment variables  
apps/api/.env           # API app environment variables
packages/ui/.env        # UI package environment variables
```

**Local Development Configuration**:
- **HOST**: `0.0.0.0` (required for container accessibility)
- **PORT**: Unique per service (3001, 3002, 3003, 3004)
- **No hardcoded ports**: Docker Compose handles port mapping
- **Package-specific configs**: Each app manages its own environment

### **Port Configuration Strategy**

**Development Ports** (Docker Compose):
- **Admin**: 3001
- **Storefront**: 3002  
- **API**: 3003
- **UI (Storybook)**: 3004

**Production Ports** (Docker Compose):
- **Admin**: 5001
- **Storefront**: 5002
- **API**: 5003
- **UI**: 5006

**Conflict Prevention**:
- **Development**: 3001-3004 range
- **Production**: 5001-5006 range
- **No overlapping**: Clear separation between environments

## 🔄 CI/CD Integration

### **`bun run ci:check` - Local GitHub Actions Testing**

#### **Act Configuration**
```bash
# .act/actrc configuration
--image-size micro
--platform ubuntu-latest
--quiet
--secret-file .env
--reuse
--artifact-server-path /tmp/artifacts
```

#### **Workflow Testing Patterns**
```bash
# Test specific workflows
bun run ci:check -e pull_request -w .github/workflows/Check.yml
bun run ci:check -e push -w .github/workflows/Build.yml
bun run ci:check -e release -w .github/workflows/Deploy.yml

# Test with custom secrets
bun run ci:check -e pull_request -w .github/workflows/Check.yml --secret-file .env.local

# Test with verbose output
bun run ci:check -e pull_request -w .github/workflows/Check.yml --verbose
```

### **`bun run ci:branchname` - Branch Validation**

#### **Branch Naming Patterns**
```bash
# Supported patterns
feature/user-authentication               # ✅ Valid
bugfix/login-validation                  # ✅ Valid
hotfix/security-patch                    # ✅ Valid
release/v1.2.0                          # ✅ Valid

# Invalid patterns
feature/UserAuth                         # ❌ Invalid (uppercase)
bugfix/login validation                  # ❌ Invalid (space)
hotfix/security_patch                    # ❌ Invalid (underscore)
```

### **Staged File Validation**

#### **`bun run check:staged` - Pre-commit Validation**
```bash
# Automatic validation of staged files
bun run check:staged                    # Check for common issues

# Validations include:
# - No manual version changes in package.json
# - No manual CHANGELOG.md entries
# - No development files committed
# - Proper file structure compliance
```

#### **Validation Patterns**
```bash
# Valid staged files
package.json                            # ✅ Auto-generated versions only
CHANGELOG.md                           # ✅ Auto-generated entries only
src/components/Button.tsx              # ✅ Source code files

# Invalid staged files
package.json with manual version        # ❌ Should be auto-generated
CHANGELOG.md with manual entries       # ❌ Should be auto-generated
.env files                             # ❌ Should not be committed
```

## 🛠️ Troubleshooting

### **Setup Debugging**
```bash
# Verbose setup with debugging
bun run local:setup --verbose --debug
bun run dev:setup --verbose --debug

# Health checks
bun run dev:check                      # Comprehensive health check
bun run dev:health                     # Quick container status
bun run check:quick                    # Quality verification
```

### **Common Issues and Solutions**

#### **DevContainer Issues**
```bash
# Container won't start
bun run dev:cleanup                    # Clean up containers
bun run dev:build                      # Rebuild containers
bun run dev:check                      # Check container health

# Port conflicts
bun run dev:health                     # Check port usage
# Manually change ports in docker-compose.dev.yml
```

#### **Dependency Issues**
```bash
# Clear dependency cache
rm -rf node_modules
rm bun.lock
bun install

# Update dependencies
bun update

# Check for conflicts
bun run check:types                    # TypeScript issues
bun run check                          # Biome issues
```

#### **Build Issues**
```bash
# Clear build cache
turbo run build --clearCache
turbo run test --clearCache

# Force rebuild
bun run build --force
bun run test --force
```

### **Performance Optimization**

#### **Development Performance**
```bash
# Fast development workflow
bun run check:quick                    # Quick quality check (~30s)
bun run test --affected                # Test only affected packages (~20s)
bun run build --affected               # Build only affected packages (~30s)

# Parallel operations
turbo run test --parallel              # Parallel test execution
turbo run build --parallel             # Parallel build execution
```

#### **Caching Strategy**
```bash
# Turbo caching
turbo run build                        # Uses Turbo cache for faster builds
turbo run test                         # Uses Turbo cache for faster tests

# Cache management
turbo run build --clearCache           # Clear build cache
turbo run test --clearCache            # Clear test cache
```

### **Environment-Specific Issues**

#### **macOS Issues**
```bash
# Docker Desktop issues
docker system prune -a                 # Clean Docker system
docker volume prune                    # Clean volumes

# Permission issues
sudo chown -R $(whoami) .             # Fix file permissions
```

#### **Linux Issues**
```bash
# Docker permissions
sudo usermod -aG docker $USER         # Add user to docker group
newgrp docker                         # Apply group changes

# File watching
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p                        # Apply changes
```

#### **Windows Issues**
```bash
# WSL2 issues
wsl --shutdown                         # Restart WSL
wsl --update                          # Update WSL

# Docker Desktop issues
# Restart Docker Desktop
# Check WSL2 integration in Docker Desktop settings
```

## 📊 Monitoring and Health Checks

### **Health Check Commands**
```bash
# Comprehensive health check
bun run dev:check                      # Full DevContainer health check

# Quick status check
bun run dev:health                     # Container status overview

# Quality verification
bun run check:quick                    # Quick quality check
bun run check:staged                   # Staged file validation
```

### **Health Check Components**
- **Container Status**: Verify all containers are running
- **Port Availability**: Check if ports are accessible
- **Service Connectivity**: Test inter-service communication
- **Volume Mounts**: Verify file system mounts
- **Environment Variables**: Check configuration
- **Dependencies**: Verify package installations

### **Logging and Debugging**
```bash
# View service logs
bun run dev:logs                       # All service logs
bun run dev:logs admin                 # Admin service logs
bun run dev:logs storefront            # Storefront service logs
bun run dev:logs api                   # API service logs

# Follow logs in real-time
bun run dev:logs -f                    # Follow all logs
bun run dev:logs -f admin              # Follow admin logs
```

---

**Ready to set up your development environment?** Follow this guide for a robust, scalable development setup! 🚀 