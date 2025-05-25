FROM oven/bun:1.2.11 AS base
RUN bun install -g turbo@2.5.3

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS dev
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./package.json ./bun.lock ./
RUN bun install

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=blog --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full/ .
RUN bun install

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .
RUN bun run build --filter=blog

FROM turbo AS runner
WORKDIR /app
RUN mkdir -p .turbo/cache && chmod -R 777 .turbo
RUN addgroup --system --gid 1001 runner-group
RUN adduser --system --uid 1001 runner-user

COPY --from=pruner --chown=runner-user:runner-group /app/out/json/ .
COPY --from=installer --chown=runner-user:runner-group /app/node_modules ./node_modules
COPY --from=build --chown=runner-user:runner-group /app/packages/ui/dist ./packages/ui/dist
COPY --from=build --chown=runner-user:runner-group /app/apps/blog/build ./apps/blog/build
COPY --from=build --chown=runner-user:runner-group /app/apps/blog/public ./apps/blog/public
COPY --from=build --chown=runner-user:runner-group /app/apps/blog/package.json ./apps/blog/package.json

USER runner-user
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["bun", "run", "start", "--filter=blog"]