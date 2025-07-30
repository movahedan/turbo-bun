# 🏷️ Changesets Version Management

> **Automated version bumping and changelog generation for the monorepo root**

This document covers how to use Changesets for managing the root monorepo version and generating changelogs. The setup is configured to only version the root monorepo (`turbo-bun`) and not individual packages.

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Workflow](#-workflow)
- [Commands](#-commands)
- [GitHub Actions](#-github-actions)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

Changesets is configured to track changes across all packages and apps in the workspace. The root monorepo version is managed separately. This provides:

- **Automated version bumping** based on conventional commits
- **Changelog generation** for all changes
- **GitHub Actions integration** for automated release PRs
- **Comprehensive changelog** for all packages and apps
- **Centralized version management** at the root level

### Configuration

```json
// .changeset/config.json
{
  "fixed": [],                   // Track all packages individually
  "access": "restricted",        // No npm publishing
  "commit": true,                // Auto-commit version changes
  "baseBranch": "main"           // Main branch for releases
}
```

**Note**: The root monorepo version (`turbo-bun`) is managed separately from the workspace packages.
```

## 🚀 Quick Start

### **Creating a Changeset**

```bash
# Create a new changeset
bun run changeset

# Follow the prompts:
# 1. Select packages that have changes (all affected packages)
# 2. Choose version bump type for each package (patch/minor/major)
# 3. Write a description of changes for each package
```

### **Versioning the Root**

```bash
# Version the root monorepo
bun run version-root

# This will:
# 1. Run quality checks (build, lint, test)
# 2. Bump the root version
# 3. Generate changelog
# 4. Commit changes
```

## 🔄 Workflow

### **Daily Development Flow**

1. **Make changes** to your codebase
2. **Create changeset** when ready to version:
   ```bash
   bun run changeset
   ```
3. **Commit changeset** to your branch
4. **Push to main** - triggers automated release PR
5. **Review and merge** release PR to version the root

### **Release Process**

1. **Changes are pushed** to main branch
2. **GitHub Action** checks for changesets
3. **Release PR** is created automatically
4. **Review changes** and merge PR
5. **Version is bumped** and changelog updated

## 📝 Commands

### **Available Scripts**

```bash
# Create a new changeset
bun run changeset

# Version the root monorepo
bun run version

# Version with quality checks
bun run version-root

# Check changeset status
bunx changeset status
```

### **Changeset Types**

When creating a changeset, choose the appropriate version bump:

- **patch** - Bug fixes and minor changes
- **minor** - New features (backward compatible)
- **major** - Breaking changes

### **Example Changeset**

```markdown
---
"@repo/ui": minor
"@repo/utils": patch
"@repo/logger": patch
"@repo/typescript-config": patch
"@repo/test-preset": patch
"admin": patch
"storefront": minor
"api": patch
---

Add comprehensive DevContainer support and UI improvements

- Add Docker Compose configuration for development
- Implement new UI components with better accessibility
- Update utility functions for better type safety
- Improve logging system for better debugging
- Update TypeScript configuration for better type safety
- Enhance test preset for better testing experience
- Improve admin interface with new features
- Enhance storefront with better user experience
- Update API with improved error handling
```

## 🤖 GitHub Actions

### **Automated Workflows**

#### **Release PR Creation**
- **Trigger**: Push to main branch
- **Action**: Creates release PR if changesets exist
- **File**: `.github/workflows/release-pr.yml`

#### **Release Deployment**
- **Trigger**: Release PR merged
- **Action**: Versions root and commits changes
- **File**: `.github/workflows/release.yml`

### **Workflow Steps**

1. **Check for changesets** in the repository
2. **Create release PR** if changesets found
3. **Comment on PRs** without changesets
4. **Version root** when PR is merged
5. **Commit version changes** automatically

## 📋 Best Practices

### **When to Create Changesets**

- ✅ **New features** added to any package or app
- ✅ **Bug fixes** and improvements in any component
- ✅ **Breaking changes** to APIs or workflows
- ✅ **Documentation updates** with functional changes
- ✅ **UI/UX improvements** in any application
- ✅ **Infrastructure changes** affecting development
- ❌ **Minor typo fixes** or formatting changes
- ❌ **Development-only changes** (tests, configs)

### **Changeset Guidelines**

```markdown
---
"@repo/ui": patch
"@repo/utils": patch
"@repo/logger": patch
"@repo/typescript-config": patch
"@repo/test-preset": patch
"admin": patch
"storefront": patch
"api": patch
---

Add comprehensive DevContainer support

- Add Docker Compose configuration for development environment
- Implement health check scripts for all services
- Add VS Code extensions support for better development experience
- Create comprehensive development workflow documentation
- Update UI components for better DevContainer integration
- Enhance utility functions for containerized development
- Improve logging system for containerized debugging
- Update TypeScript configuration for containerized development
- Enhance test preset for containerized testing
- Improve admin, storefront, and API apps for containerized deployment
```

### **Commit Message Format**

```bash
# Use conventional commits
git commit -m "feat(dev): add DevContainer support

- Add Docker Compose configuration
- Implement health check scripts
- Add VS Code extensions support"
```

## 🔧 Configuration

### **Changeset Config**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": true,
  "fixed": ["turbo-bun"],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "changeset": "bunx --install=force --bun @changesets/cli changeset",
    "version": "bunx --install=force --bun @changesets/cli version",
    "version-root": "turbo run build lint test && bunx --install=force --bun @changesets/cli version"
  }
}
```

## 🚨 Troubleshooting

### **Common Issues**

#### **No Changesets Found**
```bash
# Check if changesets exist
bunx changeset status

# Create a changeset if needed
bun run changeset
```

#### **Version Conflicts**
```bash
# Reset version if needed
git reset --hard HEAD~1
bun run version
```

#### **GitHub Actions Failures**
```bash
# Check workflow logs
# Ensure GITHUB_TOKEN has proper permissions
# Verify changeset format is correct
```

### **Manual Version Bump**

```bash
# If automated versioning fails
bun run version-root

# Or manually
bunx changeset version
git add .
git commit -m "chore(release): version bump"
git push
```

## 📚 Related Documentation

- [Development Workflow](./3_DEV_FLOWS.md) - Daily development commands
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Testing and validation
- [Setup Flows](./2_SETUP_FLOWS.md) - Environment setup
- [AI Prompt](./AI_Prompt.md) - AI-specific guidelines

---

**💡 Pro Tip**: Always create changesets for significant changes, even if they don't immediately affect the user-facing API. This helps maintain a comprehensive changelog and version history. 