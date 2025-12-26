ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

# Stage 1: Prepare - Prune the monorepo to only include backend and its dependencies
FROM base AS prepare
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn global add turbo
COPY . .
RUN turbo prune @connected-repo/backend --docker

# Stage 2: Builder - Install dependencies and build
FROM base AS builder
WORKDIR /app

# Enable Corepack and set up Yarn
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# First install dependencies (as they change less often)
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/yarn.lock ./yarn.lock

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Build the project and its dependencies
COPY --from=prepare /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# Run build
RUN npx turbo run build --filter=@connected-repo/backend

# Stage 3: Installer - Install only production dependencies
FROM base AS installer
WORKDIR /app

# Enable Corepack and set up Yarn
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy package files for production install
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/yarn.lock ./yarn.lock

# Install only production dependencies
RUN yarn install --frozen-lockfile --production=true

# Stage 4: Runner - Production runtime
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy production dependencies and built packages
COPY --from=installer --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /app/packages ./packages

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/package.json ./apps/backend/package.json

# Copy built package outputs
COPY --from=builder --chown=nodejs:nodejs /app/packages/zod-schemas/dist ./packages/zod-schemas/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/typescript-config ./packages/typescript-config

# Install curl for the healthcheck
USER root
RUN apk add --no-cache curl
USER nodejs

# Set environment variables
ENV NODE_ENV=production

# Expose the port (adjust if your backend uses a different port)
EXPOSE 3000

# Add Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q '200' || exit 1

# Run migrations then start the backend server
CMD ["sh", "-c", "cd apps/backend && node dist/db/db_script.js up && node dist/server.js"]
