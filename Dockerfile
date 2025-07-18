# ---- Build Stage ----
    FROM node:20-alpine AS build
    WORKDIR /app

    # Optional: Update npm for better dependency handling
    RUN npm install -g npm@11.4.2

    # Install dependencies (including dev)
    COPY backend/api/package.json backend/api/package-lock.json ./
    RUN npm ci

    # Copy source code (this includes tsconfig.json from backend/api/ to /app/tsconfig.json)
    COPY backend/api ./

    # Build TypeScript
    RUN npx tsc -p tsconfig.json

    # ---- Production Stage ----
    FROM node:20-alpine AS prod
    WORKDIR /app

    # Copy only production dependencies
    COPY --from=build /app/package.json /app/package-lock.json ./
    RUN npm ci --only=production

    # Copy built code to /app root
    COPY --from=build /app/dist ./

    # Copy any other needed static/config files (env, etc.)
    COPY --from=build /app/.env* ./

    # Expose the port (default 10000)
    EXPOSE 10000

    # Set environment variables (can be overridden by Render)
    ENV NODE_ENV=production

    # Start the server (adjust if your entry point is dist/start.js)
    CMD ["node", "start.js"]