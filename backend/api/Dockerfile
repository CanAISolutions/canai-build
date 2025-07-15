# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY ../../packages/tsconfig/api.json ./packages/tsconfig/api.json
COPY src ./src

# Build TypeScript
RUN npx tsc

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose port 10000 for Render
EXPOSE 10000

# Start the server
CMD ["node", "dist/Server.js"]