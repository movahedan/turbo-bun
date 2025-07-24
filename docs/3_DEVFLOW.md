# 🔄 Development Workflow
This document covers the actual development workflow and processes for the Turbo repo project.

## 📋 Table of Contents

- [Development Commands](#-development-commands)
- [Code Quality](#-code-quality)
- [Testing Workflow](#-testing-workflow)
- [Turbo Commands](#-turbo-commands)
- [Contribution](#-conventional-commits)

## 🚀 Development Commands
```bash
bun run setup          # Complete development environment setup
bun run cleanup        # Clean everything and start fresh

bun run dev:up
bun run dev:down
bun run dev:build

bun run dev:admin       # Admin dashboard (localhost:3001)
bun run dev:admin:logs
bun run dev:admin:watch

bun run check:quick     # Run a quick check on affected changes (lint,type,test,build)
```

## 🔍 Code Quality
```bash
bun run check
bun run check:fix
bun run check:types
```

## 🧪 Testing Workflow
```bash
bun run test
turbo run test --filter=@repo/ui
bun run test --watch
bun run test --coverage
bun run test --affected
bun run test --clearCache
```

## 🎯 Turbo Commands
```bash
turbo run build --filter=@repo/*
turbo run build --filter=@repo/ui
turbo run test --filter=@repo/*
turbo run check:types --filter=@repo/*
turbo run check:types --affected
```

## 🤝 Contribution

### Conventional Commits
Use `Ctrl+Shift+P` to access VS Code's command palette for conventional commits:
1. **Open Command Palette**: `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. **Type**: "Conventional Commits: Create Commit"
3. **Select commit type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
4. **Enter scope**: `repo`, `admin`, `blog`, `storefront`, `api`, `ui`
5. **Write description**: Clear, concise description of changes

Or directly commit:
```bash
git commit -m "type(scope): description

[optional body]

[optional footer]"
```

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes following the guidelines
3. Run tests and checks: `bun run check:quick`
4. Submit a pull request with a clear description
5. Ensure all CI checks pass

**For development environment setup, see [DevContainer Guide](./2_DEVCONTAINER.md).** 