# Docker Compose Setup

This monorepo uses Docker Compose with separate configurations for development and production environments, following [Docker's recommended practices](https://docs.docker.com/compose/how-tos/production/).

## File Structure

- **`docker-compose.yml`**: Base configuration (production-ready)
- **`docker-compose.dev.yml`**: Development overrides with hot reload
- **`apps/*/Dockerfile`**: Production Dockerfiles
- **`apps/*/Dockerfile.dev`**: Development Dockerfiles (optimized for hot reload)

## Services

| Service | Port | Framework | Description |
|---------|------|-----------|-------------|
| admin | 3001 | React + Vite | Admin interface |
| blog | 3002 | Remix + Vite | Blog frontend |
| storefront | 3003 | Next.js 15 | E-commerce frontend |
| api | 3004 | Express + TypeScript | Backend API |
| ui | N/A | React Components | Shared component library |

## Development Usage

### Start all services with hot reload:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Start specific service:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up admin --build
```

### Rebuild after changes:
```bash
# Rebuild specific service
docker compose -f docker-compose.yml -f docker-compose.dev.yml build storefront
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --no-deps -d storefront

# Or rebuild all
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Production Usage

### For production deployment:
```bash
# Use base configuration only
docker compose up -d

# Or with explicit production overrides (if you create compose.prod.yml)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Hot Reload Features (Development Only)

The development configuration enables:

- ✅ **File watching with polling** (`CHOKIDAR_USEPOLLING=true`)
- ✅ **Next.js hot reload** (`WATCHPACK_POLLING=true` + webpack config)
- ✅ **Vite hot reload** (polling enabled in vite.config.ts)
- ✅ **API auto-restart** (tsup watch mode)
- ✅ **Volume mounting** for live code updates
- ✅ **Shared package changes** trigger rebuilds

## Development vs Production Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Dockerfiles** | `*.Dockerfile.dev` | `Dockerfile` |
| **Volume Mounts** | Source code mounted | No volume mounts |
| **File Watching** | Polling enabled | Disabled |
| **NODE_ENV** | `development` | `production` |
| **Build Optimization** | Fast builds | Optimized builds |
| **Security** | Development ports | Production hardening |

## Troubleshooting

### Hot reload not working?
1. **Verify you're using the dev compose file**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

2. **Check environment variables are set**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec storefront env | grep WATCHPACK
   ```

3. **Verify volume mounts**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec storefront ls -la /app/apps/storefront
   ```

4. **Check service logs**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml logs storefront
   ```

### Performance issues?
- Volume mounting can be slow on some systems (especially macOS/Windows)
- Consider using [Docker Desktop's file sharing optimization](https://docs.docker.com/desktop/settings/mac/#file-sharing)
- For better performance, you might want to exclude `node_modules` from volume mounts

## Why This Approach?

Following [Docker's official guidance](https://docs.docker.com/compose/how-tos/production/):

1. **Separation of Concerns**: Base config for production, overrides for development
2. **Security**: Production config doesn't expose development-specific volumes/ports  
3. **Maintainability**: Easy to see what's different between environments
4. **Flexibility**: Can create additional override files (staging, testing, etc.)
5. **Best Practices**: Aligns with Docker Compose's intended usage patterns

## Alternative: docker-compose.override.yml

You can also rename `docker-compose.dev.yml` to `docker-compose.override.yml`. This file is automatically loaded by Docker Compose, so you can just run:

```bash
docker compose up --build
```

However, explicit naming (`docker-compose.dev.yml`) makes the intention clearer. 