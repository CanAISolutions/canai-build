# ---------------- BUILDER STAGE ----------------
# Purpose: Install dependencies, build TypeScript to JavaScript
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests first to leverage Docker cache
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies for the workspace
ENV HUSKY=0
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the backend project
WORKDIR /app/backend
RUN npm run build

# ---------------- PRODUCTION STAGE ----------------
# Purpose: Create a lean image with only runtime artifacts
FROM node:20-alpine
WORKDIR /app

# Copy package manifests required for module resolution
COPY --from=builder /app/package.json ./
COPY --from=builder /app/backend/package.json ./backend/

# Install production dependencies, ignoring postinstall scripts
RUN npm install --omit=dev --ignore-scripts

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/backend/dist ./backend/dist

# Copy environment example file to the backend directory
COPY --from=builder /app/.env.example ./backend/

# Set the final working directory to the backend service
WORKDIR /app/backend

# Set environment for production
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/start.js"]
