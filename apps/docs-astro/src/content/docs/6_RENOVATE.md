# 🤖 Renovate Configuration

> Automated dependency updates with intelligent grouping, security alerts, and monorepo optimization

## 📋 Overview

[Renovate](https://docs.renovatebot.com) is an automated dependency update tool that keeps your dependencies up-to-date while respecting your project's constraints and preferences. Our configuration is optimized for monorepo development with intelligent grouping, security alerts, and workspace-aware updates.

## 🎯 Key Features

- **Automated Updates**: Automatic pull requests for dependency updates
- **Security Alerts**: Vulnerability detection and automated fixes
- **Monorepo Optimization**: Intelligent grouping for workspace packages
- **Custom Managers**: Support for Biome and other tools
- **Dashboard Integration**: Centralized dependency management
- **Smart Scheduling**: Optimized update timing and frequency

## 🔧 Configuration Breakdown

### Base Configuration
```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "branchPrefix": "renovate/",
  "rangeStrategy": "bump",
  "extends": [
    "config:recommended",
    ":pinAllExceptPeerDependencies",
    "customManagers:biomeVersions",
    ":dependencyDashboard",
    ":semanticPrefixFixDepsChoreOthers",
    "group:monorepos",
    "group:recommended",
    "replacements:all",
    "workarounds:all"
  ]
}
```

### Key Settings Explained

#### **Branch Strategy**
- `"branchPrefix": "renovate/"`: Creates branches with `renovate/` prefix
- `"rangeStrategy": "bump"`: Uses bump strategy for version ranges

#### **Recommended Presets**
- `"config:recommended"`: Base recommended configuration
- `":pinAllExceptPeerDependencies"`: Pins all dependencies except peer deps
- `":dependencyDashboard"`: Enables dependency dashboard
- `":semanticPrefixFixDepsChoreOthers"`: Semantic commit prefixes
- `"group:monorepos"`: Optimized for monorepo structures
- `"group:recommended"`: Recommended grouping strategies

## 🏗️ Monorepo-Specific Features

### Workspace Package Rules
```json
{
  "packageRules": [
    {
      "enabled": false,
      "matchPackageNames": ["/^@repo//"]
    }
  ]
}
```

**Purpose**: Disables updates for internal workspace packages (`@repo/*`) to prevent circular dependency issues.

### Application Grouping
```json
{
  "matchFileNames": ["apps/*/package.json"],
  "groupName": "apps",
  "groupSlug": "apps",
  "matchUpdateTypes": ["minor"],
  "dependencyDashboardApproval": true
}
```

**Purpose**: Groups minor updates for all applications together for easier review.

### Shared Package Grouping
```json
{
  "matchFileNames": ["packages/*/package.json"],
  "groupName": "shared packages",
  "groupSlug": "shared-packages",
  "matchUpdateTypes": ["minor"],
  "dependencyDashboardApproval": true
}
```

**Purpose**: Groups minor updates for shared packages together.

## 🔒 Security Features

### Vulnerability Alerts
```json
{
  "vulnerabilityAlerts": {
    "enabled": true
  },
  "osvVulnerabilityAlerts": true
}
```

**Features**:
- **OSV Integration**: Open Source Vulnerability database integration
- **Automatic Detection**: Scans for known vulnerabilities
- **Automated Fixes**: Creates PRs for security updates

### React Security Updates
```json
{
  "matchPackageNames": [
    "react", "react-dom", "@types/react", "@types/react-dom"
  ],
  "groupName": "React monorepo",
  "dependencyDashboardApproval": true,
  "minimumReleaseAge": "3 days",
  "prBodyNotes": [
    "This is a major update of React. Please review the [React migration guide](https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024) for breaking changes."
  ]
}
```

**Features**:
- **Grouped Updates**: React ecosystem updates grouped together
- **Safety Delays**: 3-day minimum release age for stability
- **Migration Guidance**: Links to official migration guides

## 🛠️ Custom Managers

### Biome Version Manager
```json
{
  "customManagers": [
    {
      "customType": "jsonata",
      "datasourceTemplate": "npm",
      "depNameTemplate": "@biomejs/biome",
      "fileFormat": "json",
      "managerFilePatterns": ["/(^|/)biome.json?$/"],
      "matchStrings": [
        "{\"currentValue\": $split($.\"$schema\",(\"/\"))[-2]}"
      ]
    }
  ]
}
```

**Purpose**: Automatically updates Biome versions in `biome.json` files by parsing the schema URL.

## 📊 Dependency Dashboard

### Dashboard Features
- **Centralized View**: All pending updates in one place
- **Approval Workflow**: Manual approval for major updates
- **Group Management**: Organized by update type and package type
- **Security Overview**: Vulnerability alerts and fixes

### Dashboard Access
- **URL**: Available in Renovate PR descriptions
- **Integration**: Works with GitHub/GitLab dashboards
- **Notifications**: Configurable alerts for new updates

## 🔄 Update Strategies

### Update Types and Behavior

#### **Patch Updates**
```json
{
  "patch": {
    "automerge": true
  }
}
```
- **Automatic Merging**: Patch updates merged automatically
- **Low Risk**: Minimal breaking changes
- **Fast Deployment**: Immediate application

#### **Minor Updates**
```json
{
  "minor": {
    "automerge": true
  }
}
```
- **Automatic Merging**: Minor updates merged automatically
- **Feature Additions**: New features and improvements
- **Backward Compatible**: Generally safe to merge

#### **Major Updates**
```json
{
  "major": {
    "dependencyDashboardApproval": true
  }
}
```
- **Manual Approval**: Requires dashboard approval
- **Breaking Changes**: Potential breaking changes
- **Careful Review**: Thorough testing recommended

### Lock File Maintenance
```json
{
  "lockFileMaintenance": {
    "enabled": true,
    "automerge": true,
    "schedule": ["before 3am on monday"]
  }
}
```

**Features**:
- **Weekly Updates**: Runs before 3am on Monday
- **Automatic Merging**: Lock file updates merged automatically
- **Dependency Cleanup**: Removes unused dependencies

## 🚀 Getting Started

### Installation
1. **Install Renovate App**: [Install from GitHub Apps](https://docs.renovatebot.com/getting-started/installing-onboarding/)
2. **Repository Access**: Grant access to your repository
3. **Configuration**: The `renovate.json` file will be automatically detected

### First Run
1. **Onboarding PR**: Renovate creates a "Configure Renovate" PR
2. **Review Configuration**: Check the suggested settings
3. **Merge Configuration**: Merge to enable automated updates
4. **Monitor Dashboard**: Use the dependency dashboard for oversight

### Configuration Validation
```bash
# Validate configuration (if self-hosting)
renovate validate-config renovate.json
```

## 📈 Monitoring and Management

### Dashboard Usage
- **Overview**: See all pending updates at a glance
- **Approval**: Approve major updates manually
- **Grouping**: Review grouped updates together
- **Security**: Monitor vulnerability alerts

### PR Management
- **Automatic Creation**: PRs created automatically
- **Grouped Updates**: Related updates bundled together
- **Approval Workflow**: Major updates require approval
- **Merge Strategies**: Automatic merging for safe updates

### Notifications
- **PR Comments**: Detailed update information
- **Security Alerts**: Vulnerability notifications
- **Dashboard Updates**: Centralized management interface

## 🔧 Customization

### Adding Package Rules
```json
{
  "packageRules": [
    {
      "matchPackageNames": ["your-package"],
      "groupName": "Custom Group",
      "automerge": false,
      "dependencyDashboardApproval": true
    }
  ]
}
```

### Schedule Customization
```json
{
  "schedule": ["before 2am on monday", "before 2am on thursday"]
}
```

### Repository-Specific Rules
```json
{
  "packageRules": [
    {
      "matchPaths": ["apps/critical-app/package.json"],
      "automerge": false,
      "dependencyDashboardApproval": true
    }
  ]
}
```

## 🛡️ Security Best Practices

### Vulnerability Management
- **Automatic Scanning**: OSV integration for vulnerability detection
- **Timely Updates**: Security updates prioritized
- **Manual Review**: Critical security updates reviewed manually

### Update Safety
- **Release Age**: Minimum release age for stability
- **Testing**: Automated testing before merging
- **Rollback**: Easy rollback for problematic updates

### Access Control
- **Approval Workflow**: Manual approval for major changes
- **Dashboard Access**: Centralized control over updates
- **Audit Trail**: Complete history of dependency changes

## 📚 Related Documentation

- **[Renovate Documentation](https://docs.renovatebot.com)** - Official Renovate docs
- **[Installation Guide](https://docs.renovatebot.com/getting-started/installing-onboarding/)** - Setup instructions
- **[Configuration Options](https://docs.renovatebot.com/configuration-options/)** - All available settings
- **[Dependency Dashboard](https://docs.renovatebot.com/key-concepts/dashboard/)** - Dashboard management
- **[Development Workflow](./3_DEV_FLOWS.md)** - Daily development practices
- **[Quality Checklist](./0_QUALITY_CHECKLIST.md)** - Testing before deployment

---

**Automated dependency management for modern monorepo development.** 🤖 