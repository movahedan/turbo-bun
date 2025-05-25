# Install stage
FROM oven/bun:1.2.11 AS base
RUN bun install -g turbo@2.5.3

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS dev
WORKDIR /app
COPY . .
RUN bun install

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=storefront --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full/ .
RUN bun install

# Copy source code of pruned sub workspace and build
FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .
RUN bun run build --filter=storefront

# Run stage
FROM turbo AS runner
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=build /app/packages/ui/dist ./packages/ui/dist
COPY --from=build /app/packages/logger/dist ./packages/logger/dist
COPY --from=build /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=build /app/apps/storefront/public ./apps/storefront/public
COPY --from=build /app/apps/storefront/next.config.ts ./apps/storefront/next.config.ts

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["bun", "run", "start", "--filter=storefront"]