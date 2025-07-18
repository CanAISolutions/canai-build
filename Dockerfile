# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (including dev)
COPY package.json package-lock.json ./backend/
RUN cd backend && npm ci

# Copy source code
COPY backend ./backend

# Copy tsconfig.json
COPY tsconfig.json ./
COPY backend/tsconfig.json ./backend/tsconfig.json

# Build TypeScript
RUN npx tsc -p backend/tsconfig.json

# ---- Production Stage ----
FROM node:20-alpine AS prod
WORKDIR /app

# Copy only production dependencies
COPY --from=build /app/backend/package.json /app/backend/package-lock.json ./
RUN npm ci --only=production

# Copy built code to /app root
COPY --from=build /app/backend/dist/. ./
# Copy any other needed static/config files (env, etc.)
COPY --from=build /app/backend/.env* ./

# Expose the port (default 10000)
EXPOSE 10000

# Set environment variables (can be overridden by Render)
ENV NODE_ENV=production

# Start the server
CMD ["node", "start.js"]