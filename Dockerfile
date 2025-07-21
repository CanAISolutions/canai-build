FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package.json and tsconfig.json
COPY package*.json ./
COPY tsconfig.json ./

# Copy backend-specific files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/

# Install all dependencies
ENV HUSKY=0
WORKDIR /app
RUN npm install
WORKDIR /app/backend
RUN npm install

# Copy the rest of the backend source code
COPY backend/ ./

# Build TypeScript -> dist/
RUN npm run build

# --------------------------------------------------
# Production image – copy only the necessary artifacts
# --------------------------------------------------
FROM node:20-alpine
WORKDIR /app

# Copy production package metadata and install prod deps only
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/backend

# Copy compiled JS and all other runtime assets
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/.env.example ./

ENV NODE_ENV=development
ENV PORT=10000

EXPOSE 10000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/start.js"]