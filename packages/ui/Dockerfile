FROM oven/bun:1.2.19-alpine AS base
RUN bun install -g turbo@2.5.4

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./package.json ./bun.lock ./
COPY ./scripts ./scripts
RUN turbo prune --scope=@repo/ui --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .
COPY --from=pruner /app/scripts ./scripts
RUN bun run build --filter=@repo/ui

FROM turbo AS runner
WORKDIR /app
RUN mkdir -p .turbo/cache && chmod -R 777 .turbo
RUN addgroup --system --gid 1001 runner-group
RUN adduser --system --uid 1001 runner-user

ARG MODE=444
COPY --from=pruner --chown=runner-user:runner-group /app/out/json/ .
COPY --from=installer --chown=runner-user:runner-group /app/node_modules ./node_modules
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/ui ./packages/ui
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/utils ./packages/utils

USER runner-user
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["bun", "run", "start", "--filter=@repo/ui"]