# 🏷️ Version Management with Changesets

> **Comprehensive version management system with automated changelog generation and releases**

This document covers both the custom version management system and the standard Changesets workflow for managing versions in the monorepo.

## 📋 Table of Contents

- [Overview](#-overview)
- [Custom Version Management](#-custom-version-management)
- [Standard Changesets Workflow](#-standard-changesets-workflow)
- [Scripts and Commands](#-scripts-and-commands)
- [CI/CD Integration](#-cicd-integration)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Related Documentation](#-related-documentation)

## 🎯 Overview

This project supports two version management approaches:

1. **Custom Version Management**: Automated workflow with intelligent changeset creation
2. **Standard Changesets**: Traditional manual changeset workflow

Both approaches use [Changesets](https://github.com/changesets/changesets) for changelog generation and version management, providing:

- **Automated version bumping** based on changeset types
- **Changelog generation** for all changes
- **GitHub Actions integration** for automated workflows
- **Monorepo support** for multiple packages and apps
- **Flexible workflow** supporting both automated and manual approaches

### **Configuration**

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": true,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

## 🚀 Custom Version Management

The custom version management system provides automated workflow with intelligent changeset creation.

### **Key Features**

- **Automated Changeset Creation**: Uses Turbo's affected packages detection
- **Smart Versioning**: Automatically creates changesets for changed packages
- **Manual Override**: Developers can create changesets manually when needed
- **CI/CD Integration**: Seamless integration with GitHub Actions
- **Version Field Filtering**: Only versions packages that have version fields

### **Available Scripts**

```bash
# Automated changeset creation
bun run version:add-auto

# Deployment analysis
bun run version:deploy

# Manual changeset creation
bun run version:add

# Generate changelog and commit
bun run version:commit

# CI integration
bun run ci:attach-packages-to-deploy
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "version:add-auto": "bun run scripts/version-add-auto.ts",
    "version:deploy": "bun run scripts/version-deploy.ts",
    "version:add": "bunx @changesets/cli add",
    "version:commit": "bunx @changesets/cli version --commit",
    "ci:attach-packages-to-deploy": "bun run scripts/ci-attach-packages-to-deploy.ts"
  }
}
```

### **Workflow**

#### **Automated Changeset Creation**
```bash
# Automatically create changesets based on affected packages
bun run version:add-auto
```

**What it does**:
- Uses Turbo's affected packages detection
- Filters to only packages with version fields
- Intelligently creates/updates changesets based on:
  - **Package changes**: Uses Turbo's affected packages detection
  - **Existing changesets**: Respects manually created changesets
  - **Smart versioning**: Adds patch bumps for changed packages

#### **Deployment Analysis**
```bash
# Determine which packages need deployment after PR merge
bun run version:deploy
```

**What it does**:
- Analyzes version bump commits to identify changed packages
- Filters to only packages with version fields
- Outputs deployment information for CI/CD

### **Quick Patch Release**

```bash
bun run version:add-auto  # Automatically detects changes and creates changesets
bun run version:commit
git push
```

## 📝 Standard Changesets Workflow

The traditional Changesets workflow for manual version management.

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

## 🔄 CI/CD Integration

The version management system integrates seamlessly with GitHub Actions workflows:

### **PR Workflow** (`.github/workflows/Check.yml`)

The PR workflow consists of three separate jobs:

1. **🔍 Validate** - Runs all validation checks (linting, testing, building)
2. **🐳 Validate Docker Compose** - Tests production builds and services
3. **📋 Version Management** - Runs only if both validation jobs succeed:
   - **Analyzes changes** (`bun run version:add-auto`)
   - **Generates changelog and commits** (`bun run version:commit`)
   - **Pushes to PR branch** (`git push`)

This ensures that version changes are only applied when ALL validation checks pass.

### **Main Branch Workflow** (`.github/workflows/Main.yml`)

After PR merge, the workflow:
1. **Analyzes deployment needs** (`bun run version:deploy`)
2. **Determines which packages to deploy**
3. **Provides deployment information** for downstream processes

### **Automated Workflows**

#### **Release PR Creation**
- **Trigger**: Push to main branch
- **Action**: Creates release PR if changesets exist
- **File**: `.github/workflows/release-pr.yml`

#### **Release Deployment**
- **Trigger**: Release PR merged
- **Action**: Versions root and commits changes
- **File**: `.github/workflows/release.yml`

### **Workflow Benefits**

- **Automated Versioning**: No manual changeset creation required
- **Manual Override**: Developers can create changesets manually when needed
- **Smart Detection**: Uses Turbo's affected packages detection
- **Breaking Change Detection**: Automatically detects and handles breaking changes
- **Deployment Tracking**: Know exactly what needs to be deployed
- **PR Integration**: Version changes are part of the PR review process
- **Flexible Workflow**: Supports both automated and manual approaches

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

## 🚨 Troubleshooting

### **Common Issues**

#### **"No changeset files found"**
```bash
# Option 0: Create changesets manually (Optional)
bun run version:add
# Option 1: Run the analyze command to automatically create changesets
bun run version:add-auto
# Then run changesets version
bun run version:commit
```

#### **"Changesets version failed"**
```bash
# Check if changesets are properly configured
cat .changeset/config.json

# Try running changesets manually
bun run version:commit
```

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

### **Manual Recovery**

```bash
# If something goes wrong, you can run the workflow manually
bun run version:add-auto
bun run version:commit
git push
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

### **Changesets Commands**

```bash
# Manual changesets commands (if needed)
bunx @changesets/cli add          # Create changeset interactively
bunx @changesets/cli version      # Generate changelog and bump versions
bunx @changesets/cli release      # Publish packages (if applicable)
```

## 📚 Related Documentation

- [Development Workflow](./3_DEV_FLOWS.md) - Daily development commands
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Testing and validation
- [Setup Flows](./2_SETUP_FLOWS.md) - Environment setup
- [AI Prompt](./AI_Prompt.md) - AI-specific guidelines

---

**💡 Pro Tip**: The integration with Changesets provides the best of both worlds - automated workflow with the power of manual control when needed. The `version:add-auto` command automatically creates changesets based on actual code changes, making versioning intelligent and automated while still allowing manual overrides when desired. 