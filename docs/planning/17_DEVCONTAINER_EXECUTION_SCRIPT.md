# 🐳 DevContainer Execution Script Planning

> Comprehensive planning document for implementing command-line DevContainer execution with remote development support

## 📋 Table of Contents

- [Overview](#-overview)
- [Current State Analysis](#-current-state-analysis)
- [Requirements & Goals](#-requirements--goals)
- [Technical Architecture](#-technical-architecture)
- [Implementation Plan](#-implementation-plan)
- [Integration Strategy](#-integration-strategy)
- [Testing Strategy](#-testing-strategy)
- [Documentation Requirements](#-documentation-requirements)
- [Success Metrics](#-success-metrics)

## 🎯 Overview

This document outlines the implementation plan for a comprehensive DevContainer execution script that provides command-line access to VS Code DevContainers with full support for local, SSH, and tunnel remote development scenarios.

### Problem Statement

The current DevContainer workflow requires manual interaction through VS Code's UI, which limits automation and CI/CD integration. Developers need a command-line interface that can:

- Execute DevContainers programmatically
- Support various remote development scenarios
- Integrate with existing development workflows
- Provide consistent error handling and logging
- Support automation and scripting

### Solution Overview

```typescript
interface DevContainerExecution {
  local: {
    direct: boolean;
    containerized: boolean;
  };
  remote: {
    ssh: {
      host: string;
      user?: string;
      port?: number;
    };
    tunnel: {
      host: string;
      autoDetect: boolean;
    };
  };
  integration: {
    vsCode: string;
    projectPath: string;
    workspaceFolder: string;
  };
  features: {
    verboseLogging: boolean;
    errorHandling: boolean;
    environmentDetection: boolean;
    automaticSetup: boolean;
  };
}
```

## 🔍 Current State Analysis

### Existing Infrastructure

Based on the project documentation and codebase analysis:

#### DevContainer Configuration
```json
{
  "name": "Repo",
  "dockerComposeFile": ["docker-compose.dev.yml"],
  "service": "vscode",
  "workspaceFolder": "/app",
  "features": {
    "ghcr.io/devcontainers/features/git:1": "latest",
    "ghcr.io/devcontainers/features/github-cli:1": "latest",
    "ghcr.io/shyim/devcontainers-features/bun:0": "latest"
  }
}
```

#### Current Scripts Architecture
```typescript
// Existing patterns in scripts/utils/
interface ScriptPatterns {
  argumentParsing: "modular-arg-parser";
  commandFinding: "centralized-command-finder";
  errorHandling: "withErrorHandling-wrapper";
  scriptCreation: "createScript-utility";
}
```

#### Development Workflow
```bash
# Current workflow
bun run setup          # Install packages
bun run dev:checkup    # Load dev container
# Manual: Ctrl+Shift+P → "Dev Containers: Reopen in Container"
```

### Identified Gaps

1. **Manual Intervention Required**: DevContainer opening requires VS Code UI interaction
2. **No Remote Support**: Limited support for SSH and tunnel scenarios
3. **Inconsistent Error Handling**: No standardized error handling for DevContainer operations
4. **Limited Automation**: Cannot be easily integrated into CI/CD or automation scripts
5. **No Environment Detection**: Manual detection of WSL, SSH, and tunnel environments

## 🎯 Requirements & Goals

### Functional Requirements

#### 1. Core DevContainer Execution
- [ ] **Execute DevContainer from command line**
- [ ] **Support local development containers**
- [ ] **Handle VS Code integration seamlessly**
- [ ] **Provide consistent error handling**

#### 2. Remote Development Support
- [ ] **SSH remote containers** (`@ssh-remote%2B${ssh_host}`)
- [ ] **Tunnel remote containers** (`@tunnel%2B${tunnel_host}`)
- [ ] **Automatic remote detection**
- [ ] **Manual remote configuration**

#### 3. Environment Detection
- [ ] **WSL environment detection**
- [ ] **SSH host detection from environment**
- [ ] **Tunnel host auto-detection**
- [ ] **Cross-platform compatibility**

#### 4. Integration Requirements
- [ ] **Follow existing script patterns**
- [ ] **Use centralized command finding**
- [ ] **Implement modular argument parsing**
- [ ] **Provide comprehensive error handling**

### Non-Functional Requirements

#### 1. Performance
- [ ] **Fast execution** (< 2 seconds for local containers)
- [ ] **Minimal resource usage**
- [ ] **Efficient environment detection**

#### 2. Reliability
- [ ] **Robust error handling**
- [ ] **Graceful fallbacks**
- [ ] **Comprehensive logging**

#### 3. Usability
- [ ] **Intuitive command-line interface**
- [ ] **Helpful error messages**
- [ ] **Verbose logging option**
- [ ] **Check-only mode**

## 🏗️ Technical Architecture

### Script Structure

```typescript
// Main execution script
interface DevContainerExecScript {
  name: "DevContainer Exec";
  description: "Execute VS Code DevContainer from command line";
  options: {
    verbose: boolean;
    sshHost?: string;
    noDevcontainer: boolean;
    check: boolean;
  };
  functions: {
    execDevContainer: "Main execution logic";
    checkDevContainerConfig: "Configuration validation";
    setupDevContainer: "Environment setup";
    detectEnvironment: "Platform detection";
  };
}
```

### Core Functions

#### 1. Environment Detection
```typescript
async function detectEnvironment(verbose: boolean): Promise<{
  isWsl: boolean;
  sshHost?: string;
}> {
  // Detect WSL via /proc/version
  // Detect SSH host from environment
  // Return environment configuration
}
```

#### 2. DevContainer Execution
```typescript
async function execDevContainer(
  code: string,
  args: string[],
  options: {
    devcontainer: boolean;
    sshHost?: string;
    isWsl: boolean;
    verbose: boolean;
  }
): Promise<void> {
  // Construct folder URI
  // Handle remote scenarios
  // Execute VS Code with DevContainer
}
```

#### 3. Configuration Validation
```typescript
async function checkDevContainerConfig(): Promise<boolean> {
  // Check .devcontainer/devcontainer.json exists
  // Validate configuration structure
  // Return validation status
}
```

### Integration Points

#### 1. Command Finding System
```typescript
// Extend existing commands.ts
export const COMMANDS = {
  // ... existing commands
  code: {
    name: "code",
    paths: ["code", "/usr/local/bin/code", "/opt/homebrew/bin/code"],
    installInstructions: "Please install VS Code and ensure 'code' command is available in PATH.",
  },
};
```

#### 2. Argument Parsing
```typescript
// Use existing arg-parser.ts patterns
const config = {
  name: "DevContainer Exec",
  description: "Execute VS Code DevContainer from command line",
  options: [
    { short: "-v", long: "--verbose", validator: validators.boolean },
    { short: "-s", long: "--ssh-host", validator: validators.nonEmpty },
    { short: "-n", long: "--no-devcontainer", validator: validators.boolean },
    { short: "-c", long: "--check", validator: validators.boolean },
  ],
};
```

#### 3. Error Handling
```typescript
// Use existing createScript utility
export const devcontainerExecScript = createScript(
  config,
  async (args) => {
    // Implementation with automatic error handling
  },
  { exitOnError: true, showStack: false }
);
```

## 📋 Implementation Plan

### Phase 1: Core Implementation (Week 1)

#### 1.1 Script Foundation
- [ ] **Create devcontainer-exec.ts script**
  - Implement basic argument parsing
  - Add VS Code command finding
  - Create main execution function

#### 1.2 Environment Detection
- [ ] **Implement environment detection**
  - WSL detection via `/proc/version`
  - SSH host detection from environment
  - Cross-platform compatibility

#### 1.3 Basic DevContainer Execution
- [ ] **Implement local DevContainer execution**
  - Construct folder URI
  - Execute VS Code with DevContainer
  - Basic error handling

### Phase 2: Remote Development Support (Week 2)

#### 2.1 SSH Remote Support
- [ ] **Implement SSH remote containers**
  - Handle `@ssh-remote%2B${ssh_host}` format
  - Support SSH host configuration
  - Validate SSH connectivity

#### 2.2 Tunnel Remote Support
- [ ] **Implement tunnel remote containers**
  - Auto-detect tunnel hosts via `code --status`
  - Handle `@tunnel%2B${tunnel_host}` format
  - Fallback for tunnel detection failures

#### 2.3 Remote Validation
- [ ] **Add remote connection validation**
  - Test SSH connectivity
  - Validate tunnel availability
  - Provide helpful error messages

### Phase 3: Integration & Polish (Week 3)

#### 3.1 Package.json Integration
- [ ] **Add script to package.json**
  ```json
  {
    "scripts": {
      "devcontainer": "bun run scripts/devcontainer-exec.ts",
      "devcontainer:check": "bun run scripts/devcontainer-exec.ts --check"
    }
  }
  ```

#### 3.2 Documentation Updates
- [ ] **Update development workflow docs**
  - Add DevContainer CLI usage
  - Document remote development scenarios
  - Provide troubleshooting guide

#### 3.3 Testing & Validation
- [ ] **Comprehensive testing**
  - Test all remote scenarios
  - Validate error handling
  - Test integration with existing workflow

### Phase 4: Advanced Features (Week 4)

#### 4.1 Advanced Logging
- [ ] **Implement verbose logging**
  - Detailed execution steps
  - Environment information
  - Debug information

#### 4.2 Configuration Management
- [ ] **Add configuration options**
  - Custom VS Code arguments
  - Environment-specific settings
  - Persistent configurations

#### 4.3 CI/CD Integration
- [ ] **Prepare for automation**
  - Non-interactive mode
  - Exit code handling
  - Logging for automation

## 🔗 Integration Strategy

### Existing Workflow Integration

#### 1. Development Workflow Enhancement
```bash
# Current workflow
bun run setup
bun run dev:checkup
# Manual: Ctrl+Shift+P → "Dev Containers: Reopen in Container"

# Enhanced workflow
bun run setup
bun run dev:checkup
bun run devcontainer  # Automated DevContainer opening
```

#### 2. Script Integration
```typescript
// Integrate with existing script patterns
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";
import { validators } from "./utils/arg-parser";
```

#### 3. Command System Integration
```typescript
// Extend existing commands.ts
export const COMMANDS = {
  // ... existing commands
  code: {
    name: "code",
    paths: ["code", "/usr/local/bin/code", "/opt/homebrew/bin/code"],
    installInstructions: "Please install VS Code and ensure 'code' command is available in PATH.",
  },
};
```

### Documentation Integration

#### 1. Update DevContainer Documentation
- [ ] **Add CLI usage to docs/2_DEVCONTAINER.md**
- [ ] **Document remote development scenarios**
- [ ] **Provide troubleshooting guide**

#### 2. Update Development Workflow
- [ ] **Update docs/3_DEVFLOW.md**
- [ ] **Add DevContainer CLI commands**
- [ ] **Document integration with existing workflow**

#### 3. Create Usage Examples
- [ ] **Basic usage examples**
- [ ] **Remote development examples**
- [ ] **Troubleshooting examples**

## 📚 Documentation Requirements

### Implementation Documentation

#### 1. Code Documentation
- [ ] **Comprehensive JSDoc comments**
- [ ] **Type definitions**
- [ ] **Function documentation**

#### 2. Usage Documentation
- [ ] **Command-line usage guide**
- [ ] **Remote development guide**
- [ ] **Troubleshooting guide**

#### 3. Integration Documentation
- [ ] **Workflow integration guide**
- [ ] **Script system integration**
- [ ] **CI/CD integration guide**

### User Documentation

#### 1. Quick Start Guide
```bash
# Basic usage
bun run devcontainer

# Remote development
bun run devcontainer --ssh-host=remote-server

# Check setup
bun run devcontainer --check
```

#### 2. Advanced Usage
```bash
# Verbose logging
bun run devcontainer --verbose

# Direct VS Code (no DevContainer)
bun run devcontainer --no-devcontainer

# With VS Code arguments
bun run devcontainer -- --new-window --disable-extensions
```

#### 3. Troubleshooting
- [ ] **Common error scenarios**
- [ ] **Debug information**
- [ ] **Recovery procedures**

## 📊 Success Metrics

### Technical Metrics

#### 1. Performance
- [ ] **Execution time** < 2 seconds for local containers
- [ ] **Memory usage** < 50MB during execution
- [ ] **Startup time** < 5 seconds for remote containers

#### 2. Reliability
- [ ] **Success rate** > 95% for local containers
- [ ] **Error handling** comprehensive for all scenarios
- [ ] **Recovery rate** > 90% for recoverable errors

#### 3. Usability
- [ ] **User satisfaction** > 4.5/5 for ease of use
- [ ] **Documentation clarity** > 4.5/5 for helpfulness
- [ ] **Integration success** > 95% for existing workflow

### Business Metrics

#### 1. Developer Productivity
- [ ] **Time saved** > 30 seconds per DevContainer opening
- [ ] **Automation potential** > 80% of DevContainer operations
- [ ] **Error reduction** > 50% in DevContainer setup issues

#### 2. Workflow Efficiency
- [ ] **Integration success** > 95% with existing workflow
- [ ] **Adoption rate** > 80% among team members
- [ ] **Maintenance reduction** > 40% in DevContainer issues

## 🚀 Implementation Timeline

### Week 1: Core Implementation
- [ ] **Day 1-2**: Script foundation and basic execution
- [ ] **Day 3-4**: Environment detection and validation
- [ ] **Day 5**: Basic error handling and testing

### Week 2: Remote Development
- [ ] **Day 1-2**: SSH remote support
- [ ] **Day 3-4**: Tunnel remote support
- [ ] **Day 5**: Remote validation and testing

### Week 3: Integration & Polish
- [ ] **Day 1-2**: Package.json integration and documentation
- [ ] **Day 3-4**: Advanced features and logging
- [ ] **Day 5**: Comprehensive testing and validation

### Week 4: Advanced Features
- [ ] **Day 1-2**: Configuration management
- [ ] **Day 3-4**: CI/CD integration preparation
- [ ] **Day 5**: Final testing and deployment

## 🎯 Next Steps

### Immediate Actions
1. **Review and approve this planning document**
2. **Set up development environment for implementation**
3. **Create implementation branch**
4. **Begin Phase 1 implementation**

### Future Enhancements
1. **GUI integration** for non-command-line users
2. **Advanced configuration management**
3. **Multi-container support**
4. **Performance optimization**

---

**DevContainer Execution Script**: This planning document provides a comprehensive roadmap for implementing a robust, feature-rich DevContainer execution script that enhances developer productivity and enables automation while maintaining compatibility with existing workflows. 