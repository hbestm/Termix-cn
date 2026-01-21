# Stage 1: Install dependencies
FROM node:22-slim AS deps
WORKDIR /app

LABEL stage="dependencies"

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts --no-update-notifier

# Stage 2: Build frontend
FROM deps AS frontend-builder
WORKDIR /app

LABEL stage="frontend-builder"

# Copy source files
COPY . .

# Optimize font files
RUN find public/fonts -name "*.ttf" ! -name "*Regular.ttf" ! -name "*Bold.ttf" ! -name "*Italic.ttf" -delete

# Build frontend
RUN NODE_OPTIONS="--max-old-space-size=3072" npm run build

# Stage 3: Build backend
FROM deps AS backend-builder
WORKDIR /app

LABEL stage="backend-builder"

# Copy source files
COPY . .

# Rebuild native modules
RUN npm rebuild better-sqlite3 --force

# Build backend
RUN npm run build:backend

# Stage 4: Production dependencies only
FROM node:22-slim AS production-deps
WORKDIR /app

LABEL stage="production-deps"

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --ignore-scripts --no-update-notifier && \
    npm rebuild better-sqlite3 bcryptjs --force

# Stage 5: Final optimized image
FROM node:22-slim
WORKDIR /app

LABEL maintainer="Termix Project Team"
LABEL description="Termix SSH Client and Terminal Emulator"
LABEL version="${VERSION}"
LABEL stage="production"

# Set environment variables
ENV DATA_DIR=/app/data \
    PORT=8080 \
    NODE_ENV=production

# Install runtime packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    gettext-base \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p \
    /app/data \
    /app/uploads \
    /app/nginx \
    /app/nginx/logs \
    /app/nginx/cache \
    /app/nginx/client_body

# Set permissions
RUN chown -R node:node /app && \
    chmod 755 /app/data /app/uploads /app/nginx

# Create nginx.conf file
RUN touch /app/nginx/nginx.conf && \
    chown node:node /app/nginx/nginx.conf

# Copy nginx configs
COPY docker/nginx.conf /app/nginx/nginx.conf.template
COPY docker/nginx-https.conf /app/nginx/nginx-https.conf.template

# Copy frontend files
COPY --chown=node:node --from=frontend-builder /app/dist /app/html
COPY --chown=node:node --from=frontend-builder /app/src/locales /app/html/locales
COPY --chown=node:node --from=frontend-builder /app/public/fonts /app/html/fonts

# Copy backend files
COPY --chown=node:node --from=backend-builder /app/dist/backend ./dist/backend

# Copy production dependencies
COPY --chown=node:node --from=production-deps /app/node_modules /app/node_modules

# Copy package.json
COPY --chown=node:node package.json ./

# Expose ports
EXPOSE ${PORT} 30001 30002 30003 30004 30005 30006

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER node

# Start application
CMD ["/entrypoint.sh"]