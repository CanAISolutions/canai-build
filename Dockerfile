FROM node:20.19.0-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY backend/api/package.json backend/api/package-lock.json ./
RUN npm install --only=production

# Copy all backend source code
COPY backend/api/. ./

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 10000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 10000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]