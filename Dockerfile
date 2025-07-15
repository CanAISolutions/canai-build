# Dockerfile for CanAI Backend (Render-ready, code-based)

# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY backend/api/package.json backend/api/package-lock.json ./
RUN npm install --only=production

# Copy all backend source code
COPY backend/api/. ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the backend port
EXPOSE 10000

# Healthcheck for Render (optional, since /healthz is handled in code)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/healthz || exit 1

# Use non-root user for security (optional, can be commented out if issues)
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser

# Start the backend
CMD ["node", "server.js"]