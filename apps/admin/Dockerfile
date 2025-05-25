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
RUN turbo prune --scope=admin --docker

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
RUN bun run build --filter=admin

# Run stage
FROM nginx:alpine AS runner
WORKDIR /app

COPY --from=build /app/apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]