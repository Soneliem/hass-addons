ARG BUILD_FROM=alpine
# Builder stage
FROM $BUILD_FROM AS builder

# Install build dependencies
RUN apk add --no-cache nodejs-current npm

# Copy package files and source code
COPY package*.json /app/
COPY src /app/src
WORKDIR /app

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Build the application
RUN npm run build

# Prune to production dependencies only
RUN npm prune --production

# Runner stage
FROM $BUILD_FROM AS runner

# Install dependencies
RUN apk add --no-cache nodejs-current chromium

WORKDIR /app

# Copy built application and production dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD [ "node", "dist/index.mjs" ]