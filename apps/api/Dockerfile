FROM oven/bun:1.2.19-alpine AS base
RUN bun install -g turbo@2.5.4

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./scripts ./scripts
COPY ./package.json ./bun.lockb ./
RUN turbo prune --scope=api --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lockb ./bun.lockb
COPY --from=pruner /app/out/full/ .
RUN bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/scripts ./scripts
COPY --from=installer /app/ .
RUN bun run build --filter=api

FROM oven/bun:1.2.19-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 runner-group
RUN adduser --system --uid 1001 runner-user
RUN chown -R runner-user:runner-group /app

COPY --from=pruner --chown=runner-user:runner-group /app/out/json/ .
COPY --from=installer --chown=runner-user:runner-group /app/node_modules ./node_modules
COPY --from=build --chown=runner-user:runner-group /app/packages/logger ./packages/logger
COPY --from=build --chown=runner-user:runner-group /app/apps/api ./apps/api

USER runner-user
EXPOSE 5001
ENV NODE_ENV=production
ENV PORT=5001

CMD ["bun", "run", "./apps/api/dist/index.cjs"]