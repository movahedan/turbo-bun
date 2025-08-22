# 🐳 Docker & DevContainer Implementation

> Implementation details and hidden features of our Docker and DevContainer setup

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [DevContainer Details](#-devcontainer-details)
- [Docker Compose Strategy](#-docker-compose-strategy)
- [Hidden Features](#-hidden-features)
- [Performance Optimizations](#-performance-optimizations)

## 🎯 Overview

Our Docker setup provides a complete development and production environment with DevContainer integration, multi-service architecture, and optimized performance.

### Key Implementation Features

- **Docker-from-Docker**: Full Docker support inside DevContainer
- **Multi-Stage Builds**: Optimized production images
- **Hot Reload**: Real-time development across all frameworks
- **Port Management**: Smart port mapping to avoid conflicts
- **VS Code Integration**: Automatic extension and setting sync

## 🏗️ Architecture

### Container Structure

```
📁 Project Root
├── docker-compose.yml              # Production services
├── docker-compose.dev.yml          # Development services
├── Dockerfile.dev                  # Development base image
├── .devcontainer/
│   └── devcontainer.json           # VS Code DevContainer config
└── apps/
    ├── admin/Dockerfile            # Multi-stage production build
    ├── storefront/Dockerfile       # Multi-stage production build
    └── api/Dockerfile              # Multi-stage production build
```

### Service Architecture

| Service | Port | Framework | Environment | Purpose |
|---------|------|-----------|-------------|---------|
| `vscode` | - | DevContainer | Development | VS Code development environment |
| `admin` | 3001 | React + Vite | Both | Admin dashboard interface |
| `storefront` | 3002 | Next.js 15 | Both | E-commerce frontend |
| `api` | 3003 | Express + TypeScript | Both | Backend API server |
| `ui` | 3004 | Storybook + Vite | Development | UI component library with Storybook |

## 🐳 DevContainer Details

### Docker-from-Docker Implementation

The DevContainer uses Docker socket forwarding to enable Docker-in-Docker:

```json
// .devcontainer/devcontainer.json
{
  "mounts": [
    "source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind"
  ],
  "remoteEnv": {
    "DOCKER_HOST": "unix:///var/run/docker.sock"
  }
}
```

**Why Docker-from-Docker?**
- **Full Docker Access**: Run Docker commands inside DevContainer
- **No Docker-in-Docker**: Avoids nested virtualization performance issues
- **Socket Forwarding**: Direct access to host Docker daemon
- **Port Management**: Prevents port binding conflicts

### VS Code Configuration Sync

The DevContainer automatically syncs VS Code configuration:

```json
// .devcontainer/devcontainer.json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-docker",
        "oven.bun-vscode",
        "ms-vscode.vscode-typescript-next"
      ],
      "settings": {
        "typescript.preferences.includePackageJsonAutoImports": "on",
        "editor.formatOnSave": true
      }
    }
  }
}
```

**Automatic Sync Process**:
1. **DevContainer Creation**: Extensions and settings applied automatically
2. **Postinstall Hook**: Runs after `bun install` for dependency updates
3. **Manual Sync**: `bun run local:vscode` for manual synchronization

### GitHub Authentication Strategy

**HTTPS over SSH in DevContainers**:

```bash
# Why HTTPS instead of SSH?
# ✅ No SSH key management complexity
# ✅ Better DevContainer compatibility
# ✅ GitHub CLI integration
# ✅ Cross-platform consistency

git remote set-url origin https://github.com/user/repo.git
gh auth login
gh auth setup-git
```

## 🐙 Docker Compose Strategy

### Development vs Production

**Development Overrides** (`.devcontainer/docker-compose.dev.yml`):
```yaml
services:
  vscode:
    build:
      context: .
      dockerfile: .devcontainer/Dockerfile.vscode
    volumes:
      - ..:/workspace:cached
      - /workspace/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
```

**Production Services** (`docker-compose.yml`):
```yaml
services:
  prod-admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "5001:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
```

### Port Management Strategy

**Why Docker Compose Ports over DevContainer Port Forwarding?**

1. **Docker-from-Docker Conflicts**: DevContainer port forwarding can block host binding
2. **Multiple Environments**: Prevents conflicts when running multiple dev environments
3. **Socket Forwarding**: Requires careful port management to avoid binding conflicts

**Port Mapping**:
- **Development**: 3001-3004 (apps) managed by docker-compose.dev.yml
- **Production**: 5001-5004 (isolated from development) managed by docker-compose.yml
- **Health Checks**: All services include curl-based health checks

### Volume Mounting Strategy

**Development Volumes**:
```yaml
volumes:
  - ..:/workspace:cached          # Source code with caching
  - /workspace/node_modules       # Exclude node_modules from host
```

**Performance Optimizations**:
- **Cached Mounting**: Uses `:cached` for better performance
- **Node Modules Exclusion**: Prevents host/container conflicts
- **File Watching**: Optimized for cross-platform compatibility

## 🔧 Hidden Features

### Hot Reload Implementation

**Framework-Specific Configurations**:

**Next.js (Storefront)**:
```typescript
// apps/storefront/next.config.ts
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

**Vite (Admin)**:
```typescript
// apps/admin/vite.config.ts
server: {
  watch: {
    usePolling: true,
    interval: 1000,
  },
}
```

**Express (API)**:
```json
// apps/api/package.json
"dev": "tsup --watch --onSuccess 'bun dist/index.js'"
```

### Environment Variable Strategy

**Development Environment Variables**:
```bash
CHOKIDAR_USEPOLLING=true    # Enable polling for file watching
WATCHPACK_POLLING=true      # Enable webpack polling
DOCKER_HOST=unix:///var/run/docker.sock  # Docker socket access
```

**Production Environment Variables**:
```yaml
environment:
  - VITE_API_URL=http://api:5004      # Admin API URL
  - NEXT_PUBLIC_API_URL=http://api:5004  # Storefront API URL
```

### Health Check Implementation

**All Services Include Health Checks**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

**Why curl-based Health Checks?**
- **Lightweight**: No additional dependencies
- **HTTP-based**: Standard web service health checking
- **Configurable**: Easy to customize for different services
- **Docker Native**: Works with Docker's health check system

**Recent Improvements**:
- **Removed Hardcoded Ports**: Dockerfiles no longer have EXPOSE declarations
- **Flexible Port Management**: Docker Compose handles all port mapping
- **Improved Health Checks**: More reliable health check implementations
- **Better Container Orchestration**: Enhanced compatibility with orchestration tools

## ⚡ Performance Optimizations

### File Watching Optimizations

**Cross-Platform File Watching**:
```bash
# Environment variables for reliable file watching
CHOKIDAR_USEPOLLING=true    # Node.js file watching
WATCHPACK_POLLING=true      # Webpack file watching
```

**VS Code File Watching**:
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.turbo/**": true,
    "**/.next/**": true,
    "**/dist/**": true
  }
}
```

### Multi-Stage Build Strategy

**Production Dockerfiles**:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine AS runtime
COPY --from=builder /app /app
CMD ["npm", "start"]
```

**Benefits**:
- **Smaller Images**: Only runtime dependencies included
- **Security**: Reduced attack surface
- **Performance**: Faster container startup
- **Caching**: Better layer caching

### Resource Management

**Development Resource Limits**:
```yaml
services:
  vscode:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
        reservations:
          memory: 2G
          cpus: '1.0'
```

**Production Resource Limits**:
```yaml
services:
  prod-admin:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## 🔍 Troubleshooting Details

### Common Implementation Issues

**Docker Socket Permissions**:
```bash
# Linux: Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock
sudo usermod -aG docker $USER

# macOS/Windows: Usually handled by Docker Desktop
```

**Port Binding Conflicts**:
```bash
# Check port usage
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004

# Solution: Use Docker Compose port mapping instead of DevContainer forwarding
```

**File Watching Performance**:
```bash
# macOS/Windows: Docker Desktop settings
# - Increase memory allocation (8GB+)
# - Enable WSL2 integration (Windows)
# - Add project to file sharing

# Linux: Use overlay2 storage driver
# Edit /etc/docker/daemon.json
{
  "storage-driver": "overlay2"
}
```

### Debugging Commands

```bash
# Check DevContainer status
bun run dev:check        # Health check
bun run dev:logs         # View logs
bun run dev:health       # Container status with formatted output

# Production debugging
docker compose ps         # Production services
docker compose logs       # Production logs

# VS Code debugging
# View → Output → Dev Containers
```

### Storybook Docker Configuration

**Development Storybook Setup**:
```yaml
# .devcontainer/docker-compose.dev.yml
ui:
  extends:
    service: apps
  ports:
    - "3004:3004"
  environment:
    - PORT=3004
    - NODE_ENV=development
    - CHOKIDAR_USEPOLLING=true
    - WATCHPACK_POLLING=true
  command: bun run dev --filter=@repo/ui
  profiles: ["ui", "all"]
  healthcheck:
    test: ["CMD", "curl", "-f", "http://ui:3004"]
```

**Storybook Package Script**:
```json
// packages/ui/package.json
"dev:storybook": "bunx --bun storybook dev --no-open"
```

**Access Storybook in Docker**:
- **From Host**: `http://localhost:3004`
- **From Container**: `http://ui:3004`
- **Health Check**: `curl -f http://localhost:3004`

## 📚 Implementation Best Practices

### Development Best Practices

1. **Always Use DevContainer**: Ensures consistent environment
2. **Individual App Development**: Start only needed services
3. **Regular Cleanup**: `bun run dev:cleanup` for performance
4. **Resource Monitoring**: Keep Docker resource usage in check

### Production Best Practices

1. **Multi-Stage Builds**: Separate build and runtime stages
2. **Health Checks**: Implement proper health check endpoints
3. **Resource Limits**: Set appropriate memory and CPU limits
4. **Security Scanning**: Regular vulnerability scanning

### Configuration Best Practices

1. **Environment Separation**: Keep dev/prod configs separate
2. **Secrets Management**: Use Docker secrets or environment files
3. **Logging**: Implement structured logging across services
4. **Monitoring**: Set up monitoring and alerting

---

**For setup and usage instructions, see:**
- [Installation Guide](./1_INSTALLATION_GUIDE.md) - Initial setup
- [Setup Flows](./2_SETUP_FLOWS.md) - Development workflow
- [Dev Flows](./3_DEV_FLOWS.md) - Development commands 