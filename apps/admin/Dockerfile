FROM oven/bun:1.2.19-alpine AS base
RUN bun install -g turbo@2.5.5

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./scripts ./scripts
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=admin --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full/ .
RUN bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/scripts ./scripts
COPY --from=installer /app/ .
RUN bun run build --filter=admin

FROM nginx:alpine AS runner
WORKDIR /app
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx && \
    mkdir -p /run && \
    touch /run/nginx.pid && \
    chown -R nginx:nginx /run/nginx.pid && \
    chmod -R 755 /run/nginx.pid

COPY --from=build --chown=nginx:nginx /app/apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/apps/admin/dist/ /usr/share/nginx/html

USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]