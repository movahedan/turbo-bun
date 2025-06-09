# 🚀 Turborepo Starter

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)](https://jestjs.io)

> A comprehensive Turborepo starter maintained by Soheil Movahedan, showcasing workspace configurations and modern web development practices.

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Tools](#-development-tools)
- [Contributing](#-contributing)

## ✨ Features

- 🏗️ Full-stack monorepo setup
- 🔄 Workspace configurations
- 📦 Multiple app frameworks
- 🛠️ Shared utilities and components
- 🔒 TypeScript support throughout

## 🚀 Getting Started

### Quick Start

```sh
npx create-turbo@latest -e kitchen-sink
```

## 📁 Project Structure

### Apps and Packages

| Name | Description | Tech Stack |
|------|-------------|------------|
| `api` | Backend server | [Express](https://expressjs.com/) |
| `storefront` | E-commerce frontend | [Next.js](https://nextjs.org/) |
| `admin` | Admin dashboard | [Vite](https://vitejs.dev/) |
| `blog` | Content platform | [Remix](https://remix.run/) |
| `@repo/jest-presets` | Testing configuration | Jest |
| `@repo/logger` | Logging utility | TypeScript |
| `@repo/ui` | Shared UI components | React |
| `@repo/typescript-config` | TypeScript configuration | TypeScript |

## 🛠️ Development Tools

This Turborepo comes with a robust set of development tools:

- **TypeScript** - For static type checking
- **Biome** - For code formatting and linting
- **Jest** - For comprehensive testing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
