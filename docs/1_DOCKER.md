# 🐳 Docker Setup & Configuration

This document covers the Docker configuration and containerization setup for the Turbo repo project.

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Development Setup](#-development-setup)
- [Production Setup](#-production-setup)
- [Hot Reload Configuration](#-hot-reload-configuration)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

## 🎯 Overview

The project uses Docker for both development and production environments with:

- **DevContainer Integration**: Complete VS Code development environment
- **Multi-Service Architecture**: Each application runs in its own container
- **Hot Reload Support**: Real-time development experience
- **Production Optimization**: Optimized builds for deployment

## 🏗️ Architecture

### Container Structure

```
📁 Project Root
├── docker-compose.yml              # Production configuration
├── .devcontainer/
│   ├── docker-compose.dev.yml      # Development overrides
│   ├── devcontainer.json           # VS Code DevContainer config
│   ├── Dockerfile.vscode           # VS Code container
│   └── Dockerfile.dev              # Development base image
└── apps/
    ├── admin/Dockerfile            # Production build
    ├── blog/Dockerfile             # Production build
    ├── storefront/Dockerfile       # Production build
    └── api/Dockerfile              # Production build
```

### Services Overview

| Service | Port | Framework | Environment | Description |
|---------|------|-----------|-------------|-------------|
| `vscode` | - | DevContainer | Development | VS Code development environment |
| `admin` | 3001 | React + Vite | Both | Admin dashboard interface |
| `blog` | 3002 | Remix + Vite | Both | Content management platform |
| `storefront` | 3003 | Next.js 15 | Both | E-commerce frontend |
| `api` | 3004 | Express + TypeScript | Both | Backend API server |

## 🚀 Development Setup

### Prerequisites

- **Docker Desktop**: Latest version with sufficient resources
- **VS Code**: With Dev Containers extension
- **Git**: For version control

### Quick Start

1. **Clone and Open**:
   ```bash
   git clone <repository-url>
   cd <project-name>
   code .
   bun run dev:checkup
   ```

2. **Open in Dev Container**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Select `Dev Containers: Reopen in Container`
   - Wait for the container to build

3. **Start Development**:
   ```bash
   # Start all applications
   bun run dev:up
   
   # Or start individual applications
   bun run dev:admin
   bun run dev:blog
   bun run dev:storefront
   bun run dev:api
   ```

### Development Commands

```bash
# Container Management
bun run dev:up              # Start all containers
bun run dev:down            # Stop all containers
bun run dev:status          # Check container status
bun run dev:logs            # View application logs
bun run dev:clean           # Clean containers and volumes

# Individual Applications
bun run dev:admin           # Start admin only
bun run dev:blog            # Start blog only
bun run dev:storefront      # Start storefront only
bun run dev:api             # Start API only

# Build Commands
bun run dev:build           # Build all containers
bun run dev:build:cache     # Build without cache
```

## 🏭 Production Setup

### Production Configuration

The production setup uses optimized Docker configurations:

```bash
# Build production images
docker compose build

# Start production services
docker compose up -d

# Check production status
docker compose ps
```

### Production Services

| Service | Port | Description |
|---------|------|-------------|
| `admin-production` | 5001 | Admin dashboard |
| `blog-production` | 5002 | Blog platform |
| `storefront-production` | 5003 | E-commerce frontend |
| `api-production` | 5004 | Backend API |

### Production Commands

```bash
# Production management
bun run prod:up             # Start production services
bun run prod:down           # Stop production services
bun run prod:build          # Build production images
bun run prod:status         # Check production status
```

## 🔄 Hot Reload Configuration

### Environment Variables

The development setup includes specific environment variables for hot reload:

```bash
# File watching configuration
CHOKIDAR_USEPOLLING=true    # Enable polling for file watching
WATCHPACK_POLLING=true      # Enable webpack polling
```

### Framework-Specific Configuration

#### Next.js (Storefront)
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

#### Vite (Admin & Blog)
```typescript
// apps/admin/vite.config.ts & apps/blog/vite.config.ts
server: {
  host: "0.0.0.0",
  watch: {
    usePolling: true,
    interval: 1000,
  },
}
```

#### Express (API)
```typescript
// apps/api/package.json
"dev": "tsup --watch --onSuccess 'node dist/index.js'"
```

### Volume Mounting

Development containers use volume mounting for live code updates:

```yaml
# .devcontainer/docker-compose.dev.yml
volumes:
  - ${PROJECT_ROOT}:/workspace:cached
  - /workspace/node_modules
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Container Won't Start

**Symptoms**: Container fails to start or exits immediately

**Solutions**:
```bash
# Check Docker Desktop is running
docker --version

# Check available resources
docker system df

# Rebuild containers
bun run dev:clean
bun run dev:build
```

#### 2. Hot Reload Not Working

**Symptoms**: File changes don't trigger updates

**Solutions**:
```bash
# Check environment variables
docker compose exec storefront env | grep WATCHPACK

# Verify volume mounts
docker compose exec storefront ls -la /workspace/apps/storefront

# Restart containers
bun run dev:down
bun run dev:up
```

#### 3. Port Conflicts

**Symptoms**: "Port already in use" errors

**Solutions**:
```bash
# Check what's using the ports
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004

# Stop conflicting services
docker compose down
```

#### 4. Permission Issues

**Symptoms**: Permission denied errors

**Solutions**:
```bash
# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Rebuild DevContainer
# Ctrl+Shift+P → Dev Containers: Rebuild Container
```

### Performance Issues

#### Slow File Watching (macOS/Windows)

**Solutions**:
1. **Docker Desktop Settings**:
   - Go to Docker Desktop → Settings → Resources
   - Increase memory allocation (8GB+ recommended)
   - Enable "Use the WSL 2 based engine" (Windows)

2. **File Sharing Optimization**:
   - Add project directory to Docker Desktop file sharing
   - Exclude `node_modules` from volume mounts

3. **Alternative: Use WSL2 (Windows)**:
   ```bash
   # Install WSL2 and Docker Desktop WSL2 integration
   # Move project to WSL2 filesystem for better performance
   ```

### Debugging Commands

```bash
# Check container status
bun run dev:status

# View container logs
bun run dev:logs

# Inspect container
docker compose exec storefront sh

# Check resource usage
docker stats

# View container details
docker inspect <container-name>
```

## 📚 Best Practices

### Development Best Practices

1. **Use DevContainers**: Always develop inside the DevContainer for consistency
2. **Individual App Development**: Start only the apps you're working on
3. **Regular Cleanup**: Run `bun run dev:clean` periodically
4. **Monitor Resources**: Keep an eye on Docker resource usage

### Production Best Practices

1. **Multi-Stage Builds**: Use separate build and runtime stages
2. **Security Scanning**: Scan images for vulnerabilities
3. **Resource Limits**: Set appropriate memory and CPU limits
4. **Health Checks**: Implement health check endpoints

### Configuration Best Practices

1. **Environment Separation**: Keep development and production configs separate
2. **Secrets Management**: Use Docker secrets or environment files
3. **Logging**: Implement structured logging across all services
4. **Monitoring**: Set up monitoring and alerting for production

### File Structure Best Practices

```
📁 apps/
├── admin/
│   ├── Dockerfile              # Production optimized
│   └── .dockerignore           # Exclude unnecessary files
├── blog/
│   ├── Dockerfile
│   └── .dockerignore
└── ...
```

## 🔧 Advanced Configuration

### Custom Docker Compose Overrides

Create additional override files for different environments:

```bash
# Staging environment
docker-compose.staging.yml

# Testing environment
docker-compose.test.yml

# Local development with specific services
docker-compose.local.yml
```

### Docker Network Configuration

```yaml
# Custom network for service communication
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Resource Limits

```yaml
# Set resource limits for containers
services:
  storefront:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

## 📖 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dev Containers Documentation](https://containers.dev/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html#docker)

---

**For more information about the development environment, see [DevContainer Guide](./DEVCONTAINER.md).** 