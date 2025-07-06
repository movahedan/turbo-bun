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
- Bun (for local development)

### Quick Start

#### Option 1: All Apps (Recommended)
```bash
# Start all applications in separate containers
bun run docker:dev

# Or using docker-compose directly
docker-compose -f docker-compose.dev.yml up
```

#### Option 2: Individual Apps
```bash
# Start specific applications
bun run docker:dev:admin      # Admin only (port 3001)
bun run docker:dev:blog       # Blog only (port 3002)
bun run docker:dev:storefront # Storefront only (port 3003)
bun run docker:dev:api        # API only (port 3004)
```

#### Option 3: Local Development
```bash
# Install dependencies
bun install

# Start all apps locally
bun run dev

# Start individual apps locally
bun run dev:admin
bun run dev:blog
bun run dev:storefront
bun run dev:api
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

### Benefits of Individual Containers

✅ **Clean Logs**: Each app has its own log stream  
✅ **Port Control**: Explicit port mapping for each app  
✅ **Independent Control**: Start/stop apps individually  
✅ **Isolation**: One app's issues don't affect others  
✅ **Resource Management**: Better resource allocation  
✅ **Development Flexibility**: Work on specific apps without starting everything  

### Available Scripts

```bash
# Development
bun run dev                    # Start all apps locally
bun run dev:admin             # Start admin locally
bun run dev:blog              # Start blog locally
bun run dev:storefront        # Start storefront locally
bun run dev:api               # Start API locally

# Docker Development
bun run docker:dev            # Start all apps in containers
bun run docker:dev:admin      # Start admin container
bun run docker:dev:blog       # Start blog container
bun run docker:dev:storefront # Start storefront container
bun run docker:dev:api        # Start API container
bun run docker:dev:down       # Stop all containers

# Build & Test
bun run build                 # Build all packages
bun run test                  # Run all tests
bun run check:types           # Type checking
bun run clean                 # Clean build artifacts
```

## 🛠️ Tools

- **Bun** - Package manager and runtime
- **Turbo** - Build system and task runner
- **Docker** - Containerization
- **TypeScript** - Type safety
- **Biome** - Code formatting and linting

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