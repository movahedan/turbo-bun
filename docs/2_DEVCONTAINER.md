# 🐳 DevContainer Setup & Guide

This document covers the VS Code DevContainer configuration and development environment setup.

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

## 🎯 Overview

The project uses VS Code DevContainers to provide a consistent, isolated development environment with:

- **Complete Development Environment**: All tools and dependencies pre-installed with the host git configuration
- **Docker Integration**: Full Docker-from-Docker support with socket forwarding
- **Hot Reload**: Real-time development experience
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Team Consistency**: Same environment for all developers

## 🚀 Quick Start

### Prerequisites

1. **Install VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. **Install Dev Containers Extension** Link to [DevContainers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) 
   - Open VS Code
   - Go to Extensions (`Ctrl+Shift+X`)
   - Search for "Dev Containers"
   - Install the extension by Microsoft
3. **Install Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)

### Getting Started

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. **Open in VS Code**:
   ```bash
   code .
   ```

3. **Open in Dev Container**:
   - `bun run setup`       # Install packages
   - `bun run dev:checkup` # Load dev container (It takes 2 minutes)
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Dev Containers: Reopen in Container" and select the command
   - Wait for the container to load (Faster cause we already have a complete checkup)

4. **Setup git**:
   ```bash
   git remote set-url origin <your-repository-url>
   gh auth login
   gh auth setup-git
   ```

5. **Start Development**:
   ```bash
   # You have everything by now, start coding
   # You dont know where to start? just look at the [`package.json`](../package.json).
   ```

## ⚙️ Configuration

### Environment Variables

Configure environment variables for the DevContainer by modifying the [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json) file under the `remoteEnv` section.

### Port Forwarding

**Important**: The project uses Docker Compose port mapping instead of DevContainer port forwarding to avoid conflicts with host port binding. Port forwarding is configured in [`.devcontainer/docker-compose.dev.yml`](../.devcontainer/docker-compose.dev.yml) under the `ports` section.

**Why not DevContainer port forwarding?**
- DevContainer port forwarding can block host port binding due to the Docker-from-Docker setup
- Prevents conflicts when running multiple development environments
- Docker-from-Docker with socket forwarding requires careful port management to avoid binding conflicts


### GitHub Authentication

**Symptoms**: "Permission denied (publickey)" or authentication failures when pushing to GitHub

**Solutions**:
```bash
# Ensure HTTPS URL format
git remote set-url origin <your-repository-url>
gh auth login
gh auth setup-git

git push
```

**Why HTTPS over SSH in DevContainers?**
- **✅ No SSH key management**: Eliminates complexity of SSH agent forwarding
- **✅ Better DevContainer compatibility**: Works reliably in containerized environments
- **✅ GitHub CLI integration**: Seamless authentication with `gh auth login`
- **✅ Cross-platform**: Consistent behavior across all platforms


### DevContainer Configuration

The DevContainer is configured in [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json).

### Docker Compose Configuration

The development environment uses [`.devcontainer/docker-compose.dev.yml`](../.devcontainer/docker-compose.dev.yml).

### VS Code Extensions

The DevContainer automatically installs these extensions:

- **Docker**: `ms-azuretools.vscode-docker`
- **Bun**: `oven.bun-vscode`
- **TypeScript**: `ms-vscode.vscode-typescript-next`
- **Pretty TypeScript Errors**: `YoavBls.pretty-ts-errors`
- **Biome**: `biomejs.biome`
- **Conventional Commits**: `vivaxy.vscode-conventional-commits`
- **Auto Import**: `steoates.autoimport`
- **GitHub Actions**: `github.vscode-github-actions`
- **Camel Case Navigation**: `maptz.camelcasenavigation`
- **Code Spell Checker**: `streetsidesoftware.code-spell-checker`

### VS Code Settings

The DevContainer includes optimized settings defined in the [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json) file under the `customizations.vscode.settings` section.

### 🎯 VS Code Configuration Sync

The project automatically syncs VS Code extensions and settings from the devcontainer configuration to ensure all developers have the same development environment:

#### **Automatic Sync**
- **DevContainer Creation**: Runs automatically when the devcontainer is created
- **Postinstall**: Runs after `bun install` for dependency updates
- **Dependency Changes**: Automatically syncs when dependencies are updated

#### **Manual Sync**
```bash
# Sync VS Code configuration manually
bun run sync:vscode
```

#### **Single Source of Truth**
All VS Code settings are managed in `.devcontainer/devcontainer.json`:
- **Extensions**: Automatically installed in devcontainer
- **Settings**: Applied to both devcontainer and local workspace
- **Consistency**: Every developer gets the same experience

#### **Benefits**
- **🔄 Zero Maintenance**: No need to manually keep files in sync
- **👥 Team Consistency**: All developers get identical VS Code setup
- **⚡ Automatic Updates**: Changes propagate automatically
- **🎯 TypeScript & Bun**: Modern, fast implementation

## ✨ Features

### Development Environment

- **Bun Runtime**: Fast JavaScript runtime and package manager
- **TypeScript Support**: Full TypeScript language service
- **Biome Integration**: Code formatting and linting
- **Git Integration**: Pre-configured Git and GitHub CLI for authentication
- **Docker Support**: Docker-from-Docker with socket forwarding for containerized development

### Hot Reload Support

- **File Watching**: Optimized file watching for all frameworks
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Performance**: Optimized volume mounting and file watching
- **Framework Support**: Next.js, Vite, and Express hot reload

### Development Tools

- **Turbo**: Build system and task orchestration
- **Jest**: Testing framework
- **Commitlint**: Conventional commit validation
- **Lefthook**: Git hooks management
- **Changesets**: Version management

## 🛠️ Troubleshooting

### Common Issues

#### 1. DevContainer Won't Start

**Symptoms**: Container fails to build or start

**Solutions**:
```bash
# Check Docker Desktop is running
docker --version

# Check available resources
docker system df

# Rebuild DevContainer
# Ctrl+Shift+P → Dev Containers: Rebuild Container
```

#### 2. Permission Issues

**Symptoms**: Permission denied errors in container

**Solutions**:
```bash
# Fix Docker socket permissions (Linux)
sudo chmod 666 /var/run/docker.sock

# Add user to docker group (Linux)
sudo usermod -aG docker $USER

# Rebuild DevContainer
# Ctrl+Shift+P → Dev Containers: Rebuild Container
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

#### 4. Slow Performance

**Symptoms**: Slow file operations or container startup

**Solutions**:

1. **Docker Desktop Settings**:
   - Increase memory allocation (8GB+ recommended)
   - Enable "Use the WSL 2 based engine" (Windows)
   - Add project directory to file sharing

2. **Volume Mounting Optimization**:
   ```yaml
   volumes:
     - ..:/workspace:cached
     - /workspace/node_modules
   ```

3. **File Watching Optimization**:
   ```json
   "files.watcherExclude": {
     "**/node_modules/**": true,
     "**/.turbo/**": true,
     "**/.next/**": true,
     "**/dist/**": true
   }
   ```

#### 5. Extension Issues

**Symptoms**: Extensions not working or missing

**Solutions**:
```bash
# Rebuild DevContainer with extensions
# Ctrl+Shift+P → Dev Containers: Rebuild Container

# Check extension installation
# Ctrl+Shift+X → Check installed extensions
```

### Performance Optimization

#### macOS Performance

1. **Docker Desktop Settings**:
   - Go to Docker Desktop → Settings → Resources
   - Increase memory to 8GB+
   - Increase CPU cores to 4+
   - Enable "Use the new Virtualization framework"

2. **File Sharing**:
   - Add project directory to file sharing
   - Exclude `node_modules` and build directories

#### Windows Performance

1. **WSL2 Integration**:
   - Install WSL2: `wsl --install`
   - Enable Docker Desktop WSL2 integration
   - Move project to WSL2 filesystem

2. **Docker Desktop Settings**:
   - Go to Docker Desktop → Settings → General
   - Enable "Use the WSL 2 based engine"
   - Increase resources in Resources tab

#### Linux Performance

1. **Docker Socket Permissions**:
   ```bash
   sudo chmod 666 /var/run/docker.sock
   sudo usermod -aG docker $USER
   ```

2. **File System Optimization**:
   ```bash
   # Use overlay2 storage driver
   # Edit /etc/docker/daemon.json
   {
     "storage-driver": "overlay2"
   }
   ```

### Debugging Commands

```bash
# Run complete DevContainer tests
bun run dev:checkup
# Check DevContainer status
docker ps

# View DevContainer logs
docker logs <container-name>

# Access DevContainer shell
docker exec -it <container-name> /bin/bash

# Check VS Code server logs
# View → Output → Dev Containers
```

## 📚 Best Practices

### Development Best Practices

1. **Use DevContainers**: Always develop inside the DevContainer for consistency
2. **Regular Rebuilds**: Rebuild container when dependencies change
3. **Resource Monitoring**: Keep an eye on Docker resource usage
4. **Clean Development**: Use `bun run dev:clean` periodically

### Configuration Management

1. **Version Control**: Commit DevContainer configuration changes
2. **Team Consistency**: Share DevContainer configuration across team
3. **Documentation**: Document any custom configurations
4. **Testing**: Test DevContainer setup on different platforms

### Extension Management

1. **Essential Extensions**: Keep only necessary extensions
2. **Performance**: Monitor extension performance impact
3. **Updates**: Keep extensions updated
4. **Customization**: Customize settings for team needs

### Security Best Practices

1. **Docker Socket**: Secure Docker socket access
2. **User Permissions**: Use non-root user in container
3. **GitHub Authentication**: Use GitHub CLI with HTTPS for secure authentication
4. **Secrets**: Never commit secrets to DevContainer config
5. **Updates**: Keep base images updated

## 📖 Additional Resources

- [Dev Containers Documentation](https://containers.dev/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Bun Documentation](https://bun.sh/docs)

---

**For more information about Docker configuration, see [Docker Setup](./1_DOCKER.md).** 