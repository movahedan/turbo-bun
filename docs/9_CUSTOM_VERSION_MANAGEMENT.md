# 🏷️ Custom Version Management

> **Automated version management with comprehensive changelog generation for the monorepo**

This document covers the custom version management system that provides controlled version bumping with comprehensive changelog generation for all packages and apps.

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Commands](#-commands)
- [Workflow](#-workflow)
- [GitHub Actions](#-github-actions)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

The custom version management system provides:

- **Controlled version bumping** - Only root monorepo version is bumped
- **Comprehensive changelog generation** - All packages and apps tracked
- **Git-based workflow** - Release branches and automated validation
- **Weekly release recommendations** - Automated analysis of commit activity
- **Quality checks** - Validation of release branches and changelogs

### Key Features

- ✅ **Root-only versioning** - Only `turbo-bun` version is bumped
- ✅ **Comprehensive tracking** - All packages and apps in changelog
- ✅ **Git workflow** - Release branches with validation
- ✅ **Automated analysis** - Weekly release recommendations
- ✅ **Quality validation** - GitHub Actions for release checks

## 🚀 Quick Start

### **Initialize Release Process**

```bash
# Start a new release
bun run version:init

# This will:
# 1. Check you're on main branch and up to date
# 2. Verify clean working directory
# 3. Create release branch: release/<current-version>
```

### **Generate Changelog**

```bash
# Generate changelog for patch version
bun run version:add --patch

# Generate changelog for minor version
bun run version:add --minor

# Generate changelog for major version
bun run version:add --major
```

### **Commit and Push**

```bash
# Commit version bump
bun run version:commit

# Push release branch
bun run version:push
```

## 📝 Commands

### **Available Scripts**

```bash
# Initialize release process
bun run version:init

# Generate changelog
bun run version:add --patch   # Patch version
bun run version:add --minor   # Minor version
bun run version:add --major   # Major version

# Commit version bump
bun run version:commit

# Push release branch
bun run version:push
```

### **Version Types**

- **patch** - Bug fixes and minor changes (0.0.1 → 0.0.2)
- **minor** - New features, backward compatible (0.0.1 → 0.1.0)
- **major** - Breaking changes (0.0.1 → 1.0.0)

## 🔄 Workflow

### **Complete Release Process**

1. **Initialize Release**
   ```bash
   bun run version:init
   ```

2. **Generate Changelog**
   ```bash
   bun run version:add --minor  # or --patch, --major
   ```

3. **Review Changes**
   - Check generated `CHANGELOG.md`
   - Verify all packages are included
   - Review commit messages

4. **Commit Version**
   ```bash
   bun run version:commit
   ```

5. **Push Release**
   ```bash
   bun run version:push
   ```

6. **Create Pull Request**
   - Create PR from release branch to main
   - GitHub Actions will validate the release
   - Merge when validation passes

### **Example Changelog Output**

```markdown
## [0.1.0] - 2024-01-15

### Minor Changes

- Add comprehensive DevContainer support
- Implement new UI components with better accessibility
- Update utility functions for better type safety
- Improve logging system for better debugging
- Update TypeScript configuration for better type safety
- Enhance test preset for better testing experience
- Improve admin interface with new features
- Enhance storefront with better user experience
- Update API with improved error handling

---
```

## 🤖 GitHub Actions

### **Automated Workflows**

#### **Release Check** (`.github/workflows/release-check.yml`)
- **Trigger**: Pull requests to main, pushes to release branches
- **Action**: Validates release branches and changelogs
- **Checks**:
  - CHANGELOG.md format and content
  - Version bump validation
  - Commit message format
  - Release branch naming

#### **Release Cronjob** (`.github/workflows/release-cronjob.yml`)
- **Trigger**: Weekly (Monday 9 AM UTC), manual dispatch
- **Action**: Analyzes commit activity and recommends releases
- **Features**:
  - Analyzes commits since last release
  - Counts features, fixes, and breaking changes
  - Recommends release type (patch/minor/major)
  - Creates GitHub issues for recommended releases

### **Release Validation**

The release check workflow validates:

- ✅ **CHANGELOG.md exists** and has proper format
- ✅ **Version bump** actually occurred
- ✅ **Commit messages** follow conventions
- ✅ **Branch naming** matches version
- ✅ **Package.json version** matches changelog

## 📋 Best Practices

### **When to Release**

- ✅ **New features** added to any package or app
- ✅ **Bug fixes** and improvements
- ✅ **Breaking changes** to APIs or workflows
- ✅ **Infrastructure changes** affecting development
- ✅ **Documentation updates** with functional changes
- ❌ **Minor typo fixes** or formatting changes
- ❌ **Development-only changes** (tests, configs)

### **Release Branch Naming**

```bash
# Format: release/<version>
release/0.1.0
release/1.2.3
release/2.0.0
```

### **Commit Message Format**

```bash
# Release commit
git commit -m "chore(release): bump version to 0.1.0"

# Feature commits
git commit -m "feat(ui): add new button component"
git commit -m "feat(admin): implement user management"

# Fix commits
git commit -m "fix(api): resolve authentication issue"
git commit -m "fix(utils): correct type definition"
```

### **Changelog Guidelines**

- **Be descriptive** - Explain what changed and why
- **Group related changes** - Features, fixes, breaking changes
- **Include all packages** - Even if no direct changes
- **Use consistent formatting** - Follow the established pattern

## 🔧 Configuration

### **Script Location**

```bash
# Main script
scripts/version.ts

# Available commands
bun run version:init
bun run version:add --patch|--minor|--major
bun run version:commit
bun run version:push
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "version:init": "bun run scripts/version.ts init",
    "version:add": "bun run scripts/version.ts add",
    "version:commit": "bun run scripts/version.ts commit",
    "version:push": "bun run scripts/version.ts push"
  }
}
```

## 🚨 Troubleshooting

### **Common Issues**

#### **"Must be on main branch"**
```bash
# Switch to main branch
git checkout main
git pull origin main
bun run version:init
```

#### **"Working directory is not clean"**
```bash
# Commit or stash changes
git add .
git commit -m "feat: your changes"
# OR
git stash
bun run version:init
```

#### **"Version was not bumped"**
```bash
# Check if changelog was generated
cat CHANGELOG.md

# Regenerate changelog
bun run version:add --patch
```

#### **"Branch name doesn't match version"**
```bash
# Check current version
node -p "require('./package.json').version"

# Rename branch if needed
git branch -m release/$(node -p "require('./package.json').version")
```

### **Manual Recovery**

```bash
# Reset to main if something goes wrong
git checkout main
git branch -D release/$(node -p "require('./package.json').version")

# Start over
bun run version:init
```

### **Weekly Release Analysis**

The cronjob analyzes:

- **Commit count** since last release
- **Feature commits** (`feat:` prefix)
- **Fix commits** (`fix:` prefix)
- **Breaking changes** (`BREAKING CHANGE` in body)

**Release Recommendations:**
- **Major**: Any breaking changes
- **Minor**: 3+ features or 10+ commits
- **Patch**: 3+ fixes or 5+ commits

## 📚 Related Documentation

- [Development Workflow](./3_DEV_FLOWS.md) - Daily development commands
- [Changesets Versioning](./8_CHANGESETS_VERSIONING.md) - Alternative version management
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Testing and validation
- [Setup Flows](./2_SETUP_FLOWS.md) - Environment setup

---

**💡 Pro Tip**: Use the weekly cronjob to get automated release recommendations. It analyzes your commit activity and suggests when a release is warranted. 