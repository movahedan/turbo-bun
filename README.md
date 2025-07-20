# 🚀 Turbo Repo with DevContainer Setup

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)](https://jestjs.io)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

> A comprehensive [Turborepo](https://turbo.build/repo/docs) starter with full [DevContainer](https://containers.dev/docs) support, showcasing modern monorepo development practices with [Docker](https://docs.docker.com/) containerization.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Overview](#-overview)
- [Development Tools](#-development-tools)
- [Additional Documentation](#-additional-documentation)
- [Applications & Packages](#-applications--packages)

## 🚀 Getting Started

### Prerequisites

- **[Docker Desktop](https://docs.docker.com/desktop/)**: For containerized development
- **[VS Code](https://code.visualstudio.com/)**: With [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
- **[Git](https://git-scm.com/)**: For version control

### Quick Start

1. **Clone and open the project in VS Code**
2. **Open in Dev Container**: `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`

**For detailed setup instructions, see [DevContainer Guide](./docs/DEVCONTAINER.md), [Development Workflow](./docs/DEVFLOW.md), and [Docker Setup](./docs/DOCKER.md).**

## 🎯 Overview

This project demonstrates a production-ready [Turborepo](https://turbo.build/repo/docs) setup with:

- **Full DevContainer Integration**: Complete development environment in [Docker](https://docs.docker.com/)
- **Multi-Application Architecture**: Multiple frontend and backend applications
- **Shared Package System**: Reusable components and utilities
- **Modern Development Tools**: [TypeScript](https://www.typescriptlang.org/docs/), [Biome](https://biomejs.dev/docs/), [Jest](https://jestjs.io/docs/getting-started), and more
- **Hot Reload Support**: Real-time development experience across all applications
- **VS Code Configuration Sync**: Automatic synchronization of extensions and settings
- **Zero-Config Setup**: New developers can start coding immediately

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
- **[DevContainers](https://containers.dev/)**: Complete Docker-based development environment
- **[VS Code Extensions](https://marketplace.visualstudio.com/)**: Pre-configured for optimal development experience

## 📚 Additional Documentation
- **[Docker Setup](./docs/DOCKER.md)**: Detailed Docker configuration and usage
- **[DevContainer Guide](./docs/DEVCONTAINER.md)**: DevContainer setup and troubleshooting
- **[Development Workflow](./docs/DEVFLOW.md)**: Testing, type checking, and development processes
- **[Development Conventions](./docs/DEVCONVENTIONS.md)**: Coding standards and best practices

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

---

**Built with ❤️ using modern development tools and best practices.** 