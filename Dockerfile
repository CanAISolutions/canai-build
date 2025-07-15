# Dockerfile for CanAI Backend (Render-ready, code-based)

# Use official Node.js 18 Alpine image
FROM node:20.19.0-alpine

# Set working directory
WORKDIR /app

# Copy backend package files and install production dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install --only=production

# Copy all backend source code
COPY backend/. ./

# (Optional: Use a non-root user for security)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the backend port
EXPOSE 10000

# Healthcheck for Render (optional, since /healthz is handled in code)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 10000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the backend
CMD ["node", "server.js"]