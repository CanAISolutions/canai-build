# Build stage
FROM node:20.19.0-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY turbo.json ./
RUN npm install
COPY backend/. ./
RUN npm run build  # Ensure this outputs to /app/dist

# Production stage
FROM node:20.19.0-alpine
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install --only=production
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 10000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 10000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"
CMD ["node", "dist/Server.js"]