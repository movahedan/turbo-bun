# GitHub Actions Local Testing

This project includes optimized local testing for GitHub Actions workflows using the `act` tool.

## 🚀 Quick Start

```bash
bun run check:pipelines --help
```

## 📋 Prerequisites

- Docker running
- Devcontainer setup completed (installs `act` and configures Docker)

## 🛠️ Setup

The devcontainer automatically:
1. Installs `act` tool
2. Configures Docker permissions
3. Sets up optimized configuration

## ⚡ Performance Optimizations

### Fast Image Usage
- Uses `catthehacker/ubuntu:act-latest` (2GB) instead of full image (69GB)
- 97% size reduction for faster downloads
- Optimized for local development

### Container Cleanup
- Automatically cleans up all containers after testing
- Removes act containers, networks, and buildx builders
- Ensures clean state for each test run

## 🔧 Configuration

The testing uses optimized settings:
- **Image**: `catthehacker/ubuntu:act-latest`
- **Mode**: Quiet output for cleaner logs
- **Cleanup**: Automatic container cleanup after testing
- **Platform**: Auto-detected

## 🐛 Troubleshooting

### Common Issues

**Docker not running:**
```bash
# Start Docker
sudo systemctl start docker
```

**Act not installed:**
```bash
# Rebuild devcontainer
# Or install manually: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Permission issues:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
```

### Workflow-Specific Issues

**Check workflow fails:**
- The `act-latest` image lacks `unzip` needed for Bun setup
- This is expected for local testing
- The workflow works fine in actual GitHub Actions

**Docker Compose workflow:**
- Works perfectly with the fast image
- Validates compose files correctly

## 📁 Files

- `scripts/check-pipelines.ts` - Main testing script
- `.act/actrc` - Act configuration
- `.devcontainer/setup-docker.sh` - Devcontainer setup

## 🎯 Benefits

- **Fast**: 97% smaller images
- **Simple**: Single script approach
- **Reliable**: Works with most workflows
- **Clean**: Minimal configuration needed 

---
**For more information about Docker configuration, see [Docker Setup](./1_DOCKER.md).** 
**For development environment setup, see [DevContainer Guide](./2_DEVCONTAINER.md).** 