# 🏎️ Turboobun - Modern Monorepo Starter

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Renovate](https://img.shields.io/badge/Renovate-enabled-brightgreen)](https://docs.renovatebot.com)
[![SonarQube](https://img.shields.io/badge/SonarQube-enabled-brightgreen)](https://docs.sonarsource.com)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)](https://jestjs.io)

> **Turboobun** is a comprehensive production-ready [Turborepo](https://turbo.build/repo/docs) with [Bun](https://bun.com/) template that demonstrates modern development practices with a sophisticated toolchain integrated with [DevContainer](https://containers.dev/docs). It's designed for teams building complex applications with shared components.

### 🏄‍♂ Dive into the doc

- **[Docker Setup](./docs/1_DOCKER.md)** and **[DevContainer Guide](./docs/2_DEVCONTAINER.md)** - Complete Docker guide
- **[GitHub Actions Local Testing](./docs/6_GITHUB_ACTIONS_TEST_LOCALLY.md)** - Local CI/CD pipeline testing
- **[Development Workflow](./docs/3_DEVFLOW.md)** - Daily contribution
- **[Script Development Guide](./docs/5_SCRIPT_DEVELOPMENT_GUIDE.md)** - Structured Shell scripting with bun
- **[Development Conventions](./docs/4_DEVCONVENTIONS.md)** - Coding standards and best practices
- **[Quality Checklist](./docs/0_QUALITY_CHECKLIST.md)** - Test infrastructure changes before deployment
- **[Build Vite Library](./docs/7_BUILD_VITE_LIBRARY.md)** - Complete TypeScript library build workflow
- **[Renovate Configuration](./docs/8_RENOVATE.md)** - Automated dependency management
- **[AI Report](./docs/AI_REPORT.md)** - Automated testing and validation for AI assistants

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Overview](#-overview)
- [Development Tools](#-development-tools)
- [Additional Documentation](#-additional-documentation)
- [Applications & Packages](#-applications--packages)
- [Build System](#-build-system)

## 🚀 Getting Started

### Prerequisites

- **[Git](https://git-scm.com/)**: For version control
- **[VS Code](https://code.visualstudio.com/)**: With [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
- **[Docker Desktop](https://docs.docker.com/desktop/)**: For containerized development

### Quick Start

1. **Clone and open the project in VS Code**
```bash
git clone https://github.com/movahedan/turbo-bun.git && code turbo-bun
```
2. **Run the start script**:
```bash
bun run setup && bun run dev:checkup
```
3. **Open in Dev Container**: `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`

## 🎯 Overview

This project demonstrates a production-ready [Turborepo](https://turbo.build/repo/docs) setup with:

- **Full DevContainer Integration**: Optimized [DevContainer](https://containers.dev/) running on host machine
- **Multi-Application Architecture**: Multiple frontend and backend applications
- **Shared Package System**: Reusable components and utilities
- **Modular BunBash Scripting**: Type-safe, Documented, and Reusable [Shell scripts with Bun](https://bun.sh/docs/runtime/shell)
- **GitHub Actions Local Testing**: Optimized local testing of CI/CD pipelines using [Act](https://hub.docker.com/r/efrecon/act)
- **Modern Development Tools**: [TypeScript](https://www.typescriptlang.org/docs/), [Biome](https://biomejs.dev/docs/), [Jest](https://jestjs.io/docs/getting-started), and more
- **Hot Reload Support**: Real-time development experience across all applications
- **VS Code Configuration Sync**: Automatic synchronization of extensions and settings
- **Zero-Config Setup**: New developers can start coding immediately
- **Code Quality Assurance**: [SonarQube](https://docs.sonarsource.com) integration for continuous quality and security analysis

### Architecture
- **Monorepo Structure**: Centralized codebase with multiple applications
- **Package Management**: [Bun](https://bun.sh/docs) as the package manager for fast, reliable builds
- **Build System**: [Turbo](https://turbo.build/repo/docs) for efficient task orchestration and caching
- **Type Safety**: Full [TypeScript](https://www.typescriptlang.org/docs/) support across all applications
- **DevContainer Ready**: Complete [VS Code integration with Docker](https://containers.dev/) for isolated development

### Core Tools
- **[Bun](https://bun.sh/docs)**: Fast package manager and runtime
- **[Turbo](https://turborepo.com/docs)**: Build system and task orchestration
- **[TypeScript](https://www.typescriptlang.org/docs/)**: Type safety across the monorepo
- **[Biome](https://biomejs.dev/guides/getting-started/)**: Code formatting and linting
- **[Jest](https://jestjs.io/docs/getting-started)**: Testing framework
- **[Commitlint](https://commitlint.js.org/)**: Conventional commit validation
- **[Lefthook](https://github.com/evilmartians/lefthook)**: Git hooks management
- **[Renovate](https://docs.renovatebot.com)**: Automated dependency management
- **[SonarQube](https://docs.sonarsource.com)**: Code quality and security analysis

### Development Environment
- **[DevContainers](https://containers.dev/)**: Complete Docker-based development environment
- **[VS Code Extensions](https://marketplace.visualstudio.com/)**: Pre-configured for optimal development experience
- **[Renovate](https://docs.renovatebot.com)**: Automated dependency management
- **[SonarQube](https://docs.sonarsource.com)**: Code quality and security analysis

## 🏗️ Build System

### Advanced Library Building
The monorepo includes a sophisticated build system for TypeScript libraries:

- **[Build Vite Library Script](./docs/7_BUILD_VITE_LIBRARY.md)**: Complete workflow for building TypeScript libraries with Vite
- **Dynamic Entry Generation**: Automatically generates Vite entries from compiled TypeScript files
- **Package.json Integration**: Updates exports automatically based on built files
- **Workspace Support**: Handles dependencies between workspace packages
- **Tree-shaking Optimization**: Ensures optimal bundle sizes for consumers

### Key Features
- **TypeScript Compilation**: Full type checking and `.d.ts` generation
- **Vite Bundling**: Optimized builds with multiple output formats (ESM, CommonJS)
- **Source Maps**: Preserved for debugging and development
- **Dry Run Mode**: Preview changes without making them
- **Error Handling**: Comprehensive error reporting and cleanup

## 🔄 Dependency Management

### Automated Updates with Renovate
The monorepo uses [Renovate](https://docs.renovatebot.com) for intelligent dependency management:

- **[Renovate Configuration](./docs/8_RENOVATE.md)**: Complete automated dependency management
- **Security Alerts**: Vulnerability detection and automated fixes
- **Monorepo Optimization**: Intelligent grouping for workspace packages
- **Custom Managers**: Support for Biome and other tools
- **Dashboard Integration**: Centralized dependency management

### Key Features
- **Automated Updates**: Automatic pull requests for dependency updates
- **Security Integration**: OSV vulnerability database integration
- **Smart Grouping**: Related updates bundled together
- **Approval Workflow**: Manual approval for major updates
- **Lock File Maintenance**: Weekly dependency cleanup

### Update Strategies
- **Patch Updates**: Automatically merged (low risk)
- **Minor Updates**: Automatically merged (backward compatible)
- **Major Updates**: Require dashboard approval (breaking changes)
- **Security Updates**: Prioritized with vulnerability alerts

### Code Quality Assurance
- **[SonarQube](https://docs.sonarsource.com)**: Continuous code quality and security analysis
- **Automated Scanning**: Real-time code quality checks and security vulnerability detection
- **Quality Gates**: Enforced quality standards across the monorepo
- **Security Analysis**: Advanced security vulnerability detection and remediation guidance

## 📦 Applications & Packages

| Name | Type | Framework | Port | Description |
|------|------|-----------|------|-------------|
| `admin` | App | [React](https://react.dev/learn) + [Vite](https://vitejs.dev/guide/) | 3001 | Admin dashboard interface |
| `blog` | App | [Remix](https://remix.run/docs) + [Vite](https://vitejs.dev/guide/) | 3002 | Content management platform |
| `storefront` | App | [Next.js](https://nextjs.org/docs) 15 | 3003 | E-commerce frontend |
| `api` | App | [Express](https://expressjs.com/en/guide/routing.html) + [TypeScript](https://www.typescriptlang.org/docs/) | 3004 | Backend API server |
| `@repo/ui` | Package | [React](https://react.dev/learn) | - | Shared UI components |
| `@repo/utils` | Package | [TypeScript](https://www.typescriptlang.org/docs/) | - | Utility functions |
| `@repo/logger` | Package | [TypeScript](https://www.typescriptlang.org/docs/) | - | Logging utilities |
| `@repo/test-preset` | Package | [Jest](https://jestjs.io/docs/getting-started) | - | Testing configurations |
| `@repo/config-typescript` | Package | [TypeScript](https://www.typescriptlang.org/docs/) | - | TypeScript configurations |
| `@repo/build-tools` | Package | Build tools | - | Build utilities |

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
---

**Built with ❤️ using modern development tools and best practices.**

*Ready to build the future of web development? Clone this repository and start building your next great application!* 