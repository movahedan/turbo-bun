# 🏷️ Versioning and Deployment System

> **Simple versioning and deployment system with on-demand releases using Git tags**

This document explains the versioning and deployment system that determines affected packages and manages releases using Git tags.

## 📋 Table of Contents

- [Overview](#-overview)
- [Workflows](#-workflows)
- [Scripts](#-scripts)
- [How It Works](#-how-it-works)
- [Usage](#-usage)

## 🎯 Overview

The system provides two main workflows:

1. **Main.yml**: Analyzes affected packages from the last valid SHA for deployment
2. **Version.yml**: On-demand versioning and release management

### **Key Features**

- **Smart SHA Detection**: Automatically determines the correct base SHA for affected package analysis
- **Git Tag Version Tracking**: Uses Git tags (v*.*.*) to track versioning commits
- **On-Demand Releases**: Trigger versioning manually via GitHub button
- **Package Filtering**: Only deploys packages that have version fields

## 🔄 Workflows

### **Main.yml** - Deployment Analysis

**Trigger**: After successful Check workflow on main branch

**What it does**:
1. Analyzes affected packages from the last valid SHA
2. Filters to only packages with version fields
3. Outputs packages to deploy for downstream processes

**Base SHA Logic**:
- **Not on main branch**: Uses latest main
- **Merge commits**: Uses first parent (previous main head)
- **Regular commits**: Uses origin/main

### **Version.yml** - On-Demand Versioning

**Trigger**: Manual via GitHub Actions button

**What it does**:
1. Analyzes affected packages from last versioning commit (via Git tags)
2. Creates changesets and generates changelog
3. Commits version changes and pushes to main
4. Creates Git tag for the new version

## 📜 Scripts

### **version:commit** - Production Versioning

```bash
# Version and commit changes for production
bun run version:commit

# With output attachment for GitHub Actions
bun run version:commit --attach-to-output packages-to-deploy
```

**Features**:
- Uses last versioning commit (from Git tags) as base SHA
- Creates automated changesets
- Generates changelog and commits
- Creates Git tag for the new version
- Outputs packages to deploy

### **affected.ts** - Package Analysis

```bash
# Get affected packages from last valid SHA
bun run scripts/affected.ts
```

**Features**:
- Determines last valid SHA automatically
- Analyzes affected packages using Turbo
- Outputs JSON array of package names

## 🔧 How It Works

### **Base SHA Detection**

The system intelligently determines the correct base SHA:

```typescript
// Check if on main branch
const currentBranch = await $`git branch --show-current`.text();
const isOnMain = currentBranch.trim() === "main";

if (!isOnMain) {
  // Not on main, use latest main
  return "origin/main";
}

// For merge commits (PR merges)
const firstParent = await $`git rev-parse ${currentSha.trim()}^1`.text();
baseSha = firstParent.trim();

// For regular commits
baseSha = "origin/main";
```

### **Git Tag Version Tracking**

Production deployments use Git tags for version tracking:

```typescript
// Get last versioning commit from Git tags
const tags = await $`git tag --list "v*" --sort=-version:refname`.text();
const latestTag = tags.split("\n")[0];
const commitSha = await $`git rev-list -n 1 ${latestTag}`.text();

// If no version tags exist, use initial commit
if (tags.length === 0) {
  const initialCommit = await $`git rev-list --max-parents=0 HEAD`.text();
  return initialCommit.trim();
}

// Create new version tag
await $`git tag -a v${newVersion} -m "Release version ${newVersion}"`.text();
```

### **Package Filtering**

Only packages with version fields are considered for deployment:

```bash
# Check if package has version field
if [[ -f "$PKG_PATH" ]] && jq -e '.version' "$PKG_PATH" >/dev/null 2>&1; then
  echo "$pkg"
fi
```

## 📝 Usage

### **For Deployment Analysis**

The Main.yml workflow automatically runs after successful checks and:
1. Determines affected packages from last valid SHA
2. Filters to only versioned packages
3. Outputs deployment information

### **For Production Releases**

1. Go to GitHub Actions → Version workflow
2. Click "Run workflow"
3. The workflow will:
   - Analyze packages from last versioning commit (Git tag)
   - Create changesets and generate changelog
   - Commit and push version changes
   - Create Git tag for the new version

### **Manual Commands**

```bash
# Analyze affected packages
bun run scripts/affected.ts

# Version and commit for production
bun run version:commit

# List version tags
git tag --list "v*" --sort=-version:refname

# Get commit SHA for a tag
git rev-list -n 1 v1.0.0
```

## 🔍 Example Output

### **Affected Packages Analysis**
```json
["@repo/ui", "@repo/utils", "admin", "storefront"]
```

### **Git Tags**
```bash
v1.2.3
v1.2.2
v1.2.1
v1.2.0
```

### **Get Commit SHA from Tag**
```bash
git rev-list -n 1 v1.2.3
# Output: abc123def456...
```

## 🚨 Important Notes

1. **Git tags are automatic**: No manual initialization needed
2. **Production only**: The system is designed for production deployments
3. **Smart SHA detection**: Handles both merge and regular commits
4. **Package filtering**: Only deploys packages with version fields
5. **On-demand releases**: Use GitHub Actions button for releases
6. **Tag format**: Uses `v*.*.*` format for version tags
7. **Initial commit fallback**: If no version tags exist, uses the initial commit as base SHA

---

**💡 Pro Tip**: The system automatically handles the complexity of determining the correct base SHA for affected package analysis and uses Git tags for reliable version tracking, making deployment decisions consistent and traceable. 