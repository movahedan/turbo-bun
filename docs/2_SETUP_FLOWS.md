# 🔧 In-Depth Setup Flows

> **Advanced technical details and workflows for development environment setup**

This document provides detailed technical information about the setup flows, configuration options, and advanced usage patterns. For basic installation, see the [Installation Guide](./1_INSTALLATION_GUIDE.md).

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
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
│  ├── Testing (jest, turbo)                                  │
│  └── Build System (turbo, vite)                             │
├─────────────────────────────────────────────────────────────┤
│  🐳 DevContainer Layer (Optional)                           │
│  ├── Docker Services (admin, blog, storefront, api)         │
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

## 🛠️ Troubleshooting

### **Setup Debugging**
```bash
bun run local:setup --verbose --debug
bun run dev:setup --verbose --debug
```


### **Recovery Procedures**

#### **Complete Reset**
```bash
# Nuclear option - complete reset
bun run local:cleanup --force
bun run dev:rm --force
rm -rf node_modules package-lock.json
bun run local:setup --fresh
```

## 📚 Related Documentation

- [Installation Guide](./1_INSTALLATION_GUIDE.md) - Basic installation steps
- [Development Workflow](./3_DEV_FLOWS.md) - Daily development commands
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Testing procedures
- [Docker Setup](./5_DOCKER.md) - Docker configuration

---

**💡 Pro Tip**: Use `bun run local:setup --help` and `bun run dev:setup --help` to see all available options for each command. 