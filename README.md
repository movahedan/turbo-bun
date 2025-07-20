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

---

# Development Setup with Hot Reload

This monorepo uses Docker Compose for development with full hot reload support across all services.

## Services

- **Admin** (Port 3001): React + Vite frontend
- **Blog** (Port 3002): Remix + Vite frontend  
- **Storefront** (Port 3003): Next.js 15 frontend
- **API** (Port 3004): Express + TypeScript backend
- **UI**: Shared component library

## Hot Reload Configuration

### Environment Variables
- `CHOKIDAR_USEPOLLING=true`: Enables file watching via polling (required for Docker)
- `WATCHPACK_POLLING=true`: Enables webpack/Next.js polling for hot reload

### Next.js Configuration
The `apps/storefront/next.config.ts` includes webpack dev middleware settings:
```typescript
webpack: (config, { dev }) => {
  if (dev) {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
  }
  return config;
}
```

### Vite Configuration
Both admin and blog apps have polling enabled in their vite.config.ts:
```typescript
server: {
  host: "0.0.0.0",
  watch: {
    usePolling: true,
    interval: 1000,
  },
}
```

## Usage

1. **Start all services:**
   ```bash
   docker compose up --build
   ```

2. **Start specific service:**
   ```bash
   docker compose up admin --build
   ```

3. **Access applications:**
   - Admin: http://localhost:3001
   - Blog: http://localhost:3002  
   - Storefront: http://localhost:3003
   - API: http://localhost:3004

## Hot Reload Features

- ✅ File changes are detected automatically
- ✅ Browser refreshes automatically for all frontends
- ✅ API restarts automatically when backend files change
- ✅ Shared UI package changes trigger rebuilds in consuming apps
- ✅ TypeScript compilation happens in watch mode

## Troubleshooting

If hot reload isn't working:

1. **Check environment variables** are set in docker-compose.yml
2. **Verify volume mounts** point to correct paths
3. **Check logs** with `docker compose logs [service-name]`
4. **Restart containers** with `docker compose restart`

## File Watching Notes

Based on [Next.js Issue #36774](https://github.com/vercel/next.js/issues/36774), Docker containers require polling-based file watching instead of native filesystem events. This setup implements all the recommended solutions:

- Webpack polling configuration
- Chokidar polling environment variables  
- Proper volume mounting to avoid node_modules conflicts
- Development-optimized Dockerfiles 

# Kitchen Sink Monorepo

A comprehensive monorepo showcasing multiple applications and packages using modern development tools.

## 🏗️ Architecture

This monorepo follows best practices for containerized development with individual Docker containers for each application, ensuring clean separation of concerns and isolated logging.

### Applications
- **Admin** (React + Vite) - Port 3001
- **Blog** (Remix + Vite) - Port 3002  
- **Storefront** (Next.js) - Port 3003
- **API** (Express) - Port 3004

### Packages
- **@repo/ui** - Shared UI components
- **@repo/utils** - Utility functions
- **@repo/logger** - Logging utilities
- **@repo/jest-presets** - Testing configurations
- **@repo/typescript-config** - TypeScript configurations

## 🚀 Development

### Prerequisites
- Docker & Docker Compose
- VS Code with Dev Containers extension

### Quick Start with DevContainers (Recommended)

1. **Open in Dev Container:**
   - Open project in VS Code
   - `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`

2. **Start Apps from VS Code Terminal:**
```bash
# Start individual apps (recommended for focused development)
bun run dev:storefront  # Storefront only (localhost:3003)
bun run dev:admin       # Admin only (localhost:3001)
bun run dev:blog        # Blog only (localhost:3002)
bun run dev:api         # API only (localhost:3004)

# Or start all apps together
bun run dev:up          # All services
```

3. **Access Applications:**
   - **Admin**: http://localhost:3001
   - **Blog**: http://localhost:3002
   - **Storefront**: http://localhost:3003
   - **API**: http://localhost:3004

### Alternative: Host Development

```bash
# From your host terminal (outside devcontainer):
bun run dev:storefront  # Same commands work!

# Or local development (requires local Bun installation):
bun install && bun run dev
```

### Container Structure

Each application has its own `Dockerfile.dev` that:
- Extends from `repo-dev-base:latest`
- Exposes a specific port
- Runs the app in development mode with hot reload
- Provides isolated logging

```
📁 apps/
├── admin/Dockerfile.dev      # Port 3001
├── blog/Dockerfile.dev       # Port 3002
├── storefront/Dockerfile.dev # Port 3003
└── api/Dockerfile.dev        # Port 3004
```

### Benefits of This Setup

✅ **Unified Workflow**: Run all commands from VS Code terminal  
✅ **Clean Development Environment**: Consistent across team members  
✅ **Independent App Control**: Start/stop apps individually  
✅ **Hot Reload**: All apps support live reloading  
✅ **Isolation**: One app's issues don't affect others  
✅ **Cross-Platform**: Works on macOS, Windows, and Linux  
✅ **Docker Desktop Integration**: All containers visible for debugging  

### Available Scripts

```bash
# Docker Development (From VS Code DevContainer or Host)
bun run dev:up          # Start all apps in containers
bun run dev:storefront  # Start storefront only
bun run dev:admin       # Start admin only  
bun run dev:blog        # Start blog only
bun run dev:api         # Start API only
bun run dev:down        # Stop all containers
bun run dev:status      # Check container status

# Local Development (Requires local Bun installation)
bun run dev                    # Start all apps locally
bun run dev:admin             # Start admin locally
bun run dev:blog              # Start blog locally
bun run dev:storefront        # Start storefront locally
bun run dev:api               # Start API locally

# Build & Test
bun run build                 # Build all packages
bun run test                  # Run all tests
bun run check:types           # Type checking
```

## 🛠️ Tools

- **Bun** - Package manager and runtime
- **Turbo** - Build system and task runner
- **Docker** - Containerization with DevContainers
- **TypeScript** - Type safety
- **Biome** - Code formatting and linting

## 🚨 Troubleshooting

### DevContainer Issues
- **Container won't start**: Ensure Docker Desktop is running and you have enough resources allocated
- **Permission errors**: Try rebuilding the container (`Ctrl+Shift+P` → `Dev Containers: Rebuild Container`)
- **Port conflicts**: Check if ports 3001-3004 are already in use

### App Issues
- **App won't start**: Check container logs with `bun run dev:status` and `docker logs [container-name]`
- **Hot reload not working**: Ensure the container is running and ports are properly mapped
- **Cross-platform errors**: Never run `bun install` on the host for containerized development

### Quick Fixes
```bash
# Clean restart everything
bun run dev:clean
bun run dev:storefront

# Check what's running
bun run dev:status
docker ps
```

## 📝 Best Practices

This setup follows monorepo best practices from:
- [Karel's Best Practices](https://thekarel.gitbook.io/best-practices/constraints/monorepo)
- [Surviving Monorepos](https://github.com/amirilovic/surviving-monorepos)
- [Divio's Multiple Dockerfiles Guide](https://www.divio.com/blog/guide-using-multiple-dockerfiles/)

## 🔧 Configuration

- **Docker**: `docker-compose.dev.yml` orchestrates all services
- **DevContainer**: `.devcontainer/devcontainer.json` for VS Code integration
- **Turbo**: `turbo.json` for build pipeline configuration
- **Biome**: `biome.json` for code formatting and linting 