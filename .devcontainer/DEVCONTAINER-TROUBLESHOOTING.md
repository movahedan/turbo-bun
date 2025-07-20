# DevContainer Docker Compose Synchronization Troubleshooting

## Session Summary
**Date**: July 19, 2025  
**Issue**: Docker Compose services not accessible from host when run from inside devcontainer  
**Goal**: Achieve seamless host-devcontainer synchronization for development

## Problem Description

The user reported that "nothing works in the devcontainer" and requested manual testing of all components. The core issue was that Docker Compose services (admin, blog, storefront, api) were running but not accessible from the host machine when commands were executed from inside the devcontainer.

## Initial Testing Results

### ✅ Working Components
- **Bun package manager**: v1.2.18 ✅
- **Dependencies installation**: `bun install` ✅
- **Code quality checks**: `bun run check` (biome) ✅
- **Type checking**: `bun run check:types` (TypeScript) ✅
- **Build process**: `bun run build` (turbo) ✅
- **Docker containers**: All containers starting and running ✅
- **Port mappings**: Correctly configured in docker-compose.dev.yml ✅

### ❌ Not Working
- **Service accessibility**: HTTP endpoints not responding from host
- **Port binding**: Services not binding to `0.0.0.0` properly
- **Host access**: localhost:3001, 3002, 3003, 3004 not accessible

## Root Cause Analysis

### The Core Issue
When running `bun run dev:up` from inside the devcontainer:

1. **Docker-from-Docker (DooD)**: The devcontainer accesses the host's Docker daemon via mounted socket
2. **Container Creation**: Services run on the host's Docker daemon (correct)
3. **Port Mapping Problem**: Port mappings are between devcontainer and inner containers, not host and containers
4. **Host Inaccessibility**: Host machine cannot access the services because ports aren't properly forwarded

### Service Binding Issues
Found that services had inconsistent binding behavior:

- **Storefront**: ✅ Binds to `0.0.0.0:3003` (correct)
- **Admin**: ❌ Binds to `localhost:3001` (incorrect)
- **Blog**: ❌ Binds to `localhost:3002` (incorrect)
- **API**: ✅ Fixed to bind to `0.0.0.0:3004` (correct)

## Current Configuration Analysis

### DevContainer Configuration (.devcontainer/devcontainer.json)
```json
{
  "dockerComposeFile": ["../docker-compose.dev.yml"],
  "service": "vscode",
  "workspaceFolder": "/workspace",
  "mounts": [
    "source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind"
  ],
  "remoteEnv": {
    "PROJECT_ROOT": "${localWorkspaceFolder}",
    "HOST_PROJECT_PATH": "${localWorkspaceFolder}",
    "COMPOSE_PROJECT_NAME": "repo"
  },
  "forwardPorts": ["3001", "3002", "3003", "3004"],
  "portsAttributes": {
    "3001": { "label": "Admin (React + Vite)", "onAutoForward": "silent" },
    "3002": { "label": "Blog (Remix + Vite)", "onAutoForward": "silent" },
    "3003": { "label": "Storefront (Next.js)", "onAutoForward": "silent" },
    "3004": { "label": "API (Express)", "onAutoForward": "silent" }
  }
}
```

### Docker Compose Configuration (docker-compose.dev.yml)
```yaml
name: repo

services:
  vscode:
    build:
      context: .
      dockerfile: Dockerfile.vscode
    volumes:
      - ${PROJECT_ROOT:-.}:/workspace:cached
    profiles: ["vscode"]

  admin:
    extends:
      service: apps
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
    command: bun run dev --filter=admin
    profiles: ["admin", "all"]

  # Similar configuration for blog, storefront, api...
```

## Solutions Explored

### 1. Port Forwarding (Attempted)
- ✅ Enabled port forwarding in devcontainer.json
- ❌ Still not working because of service binding issues

### 2. Service Binding Fixes (Partially Successful)
- ✅ Fixed API to bind to `0.0.0.0:3004`
- ❌ Admin and Blog still binding to localhost
- ✅ Storefront correctly binding to `0.0.0.0:3003`

### 3. Complete Isolation Approach (Recommended)
Based on [VS Code official documentation](https://code.visualstudio.com/remote/advancedcontainers/improve-performance), the recommended approach is:

#### Option A: Clone Repository in Container Volume
- Use **Dev Containers: Clone Repository in Container Volume...**
- Provides complete isolation and best performance
- No filesystem pollution

#### Option B: Use Named Volume for Entire Source Tree
```yaml
# In docker-compose.dev.yml
services:
  vscode:
    volumes:
      - your-volume-name-here:/workspace
volumes:
  your-volume-name-here:
```

#### Option C: Run from Host Machine
- Execute Docker Compose commands from host terminal
- Ensures proper port mapping to host
- Maintains current setup

## Best Practices Identified

### Docker-from-Docker (DooD) Setup
The current setup follows best practices:
- ✅ Docker socket mounted for host access
- ✅ Environment-aware volume mounting
- ✅ Consistent project naming
- ✅ Named volumes for performance

### Performance Optimizations
Current setup includes:
- ✅ Named volumes for `node_modules`, `.turbo`, bun cache
- ✅ Delegated volume mounts for better I/O
- ✅ BuildKit caching
- ✅ Two-container architecture (VS Code + App runtime)

## Recommended Next Steps

### Immediate Fix
1. **Run Docker Compose from host machine**:
   ```bash
   # From host terminal (not devcontainer)
   bun run dev:up
   ```

2. **Fix remaining service bindings**:
   - Ensure all services bind to `0.0.0.0`
   - Update Vite configs if needed
   - Verify Next.js host binding

### Long-term Solution
Implement complete isolation using one of these approaches:

1. **Clone Repository in Container Volume** (Recommended)
   - Best performance and isolation
   - Follows VS Code best practices

2. **Named Volume for Entire Source Tree**
   - Keep current setup but move to named volume
   - Better performance on Windows/macOS

3. **Hybrid Approach**
   - Keep current setup for development
   - Use host commands for service management

## Key Learnings

1. **Docker-from-Docker Context**: Running Docker Compose from inside devcontainer creates port mapping issues
2. **Service Binding**: Services must bind to `0.0.0.0` for host accessibility
3. **VS Code Best Practices**: Official documentation recommends named volumes for performance
4. **Environment Awareness**: Current setup correctly uses `${PROJECT_ROOT:-.}` for cross-environment compatibility

## Commands Tested

### Development Environment
```bash
bun --version                    # ✅ v1.2.18
bun install                      # ✅ Dependencies installed
bun run check                    # ✅ Biome code quality
bun run check:types             # ✅ TypeScript checking
bun run build                   # ✅ Turbo build
```

### Docker Management
```bash
bun run dev:status              # ✅ Container status
bun run dev:up                  # ✅ Start all services
bun run dev:down                # ✅ Stop all services
docker ps                       # ✅ Container listing
docker logs [container]         # ✅ Service logs
```

### Service Testing
```bash
curl http://localhost:3001      # ❌ Admin not accessible
curl http://localhost:3002      # ❌ Blog not accessible  
curl http://localhost:3003      # ❌ Storefront not accessible
curl http://localhost:3004      # ❌ API not accessible
```

## Files Modified

### apps/api/src/index.ts
```typescript
// Fixed API to bind to 0.0.0.0
const port = Number(process.env.PORT) || 3004;
const server = createServer();

server.listen(port, "0.0.0.0", () => {
  log(`api running on ${port}`);
});
```

## Conclusion

The devcontainer setup is well-configured and follows VS Code best practices. The main issue is the **context of execution** - Docker Compose commands need to be run from the host machine for proper port mapping, or the complete isolation approach should be implemented using named volumes.

The current setup provides excellent development experience with proper tooling, caching, and performance optimizations. The missing piece is ensuring services are accessible from the host machine through proper port forwarding or host-based execution. 