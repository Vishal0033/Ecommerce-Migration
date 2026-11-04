# RetailMax Monolith API - Multi-Stage Production Dockerfile
FROM node:20-slim AS builder

WORKDIR /app

# Install native dependencies required by Prisma engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code
COPY . .

# Enforce PostgreSQL schema for container builds & generate client
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma && npx prisma generate

# Runner stage
FROM node:20-slim AS runner

WORKDIR /app

# Install native runtime dependencies for Prisma and healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy generated Prisma engine & client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts

# Create non-root user for security
RUN useradd -m -u 1001 nodejs && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Automated healthcheck for AWS ALB & Docker
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed.js && node src/server.js"]
