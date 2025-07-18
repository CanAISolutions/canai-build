# Backend TypeScript Migration & Docker Deployment Plan

## 1. **Project Audit & Inventory**

- [ ] **Inventory all backend entrypoints**
  - Identify the main server start file (e.g., `start.ts`, `server.ts`).
  - Confirm the build output location (e.g., `dist/`).
- [ ] **Audit all scripts in `package.json`**
  - Ensure `build`, `start`, and `dev` scripts are TypeScript-aware.
  - Confirm no references to `.js` files in scripts or configs.
- [ ] **Check TypeScript configuration**
  - Validate `tsconfig.json` for correct `outDir`, `rootDir`, and module settings.
  - Ensure all source files are included and no legacy JS files are referenced.

## 2. **Build Process Validation**

- [ ] **Run a clean build**
  - Remove any old `dist/` or build artifacts.
  - Run `npm run build` in the backend and confirm output in `dist/`.
- [ ] **Check build output**
  - Ensure all expected files (e.g., `dist/start.js`, `dist/server.js`) exist.
  - Confirm no `.ts` files are present in the build output.

## 3. **Dockerfile Redesign**

- [ ] **Base image selection**
  - Use an official Node.js image (e.g., `node:20-alpine`).
- [ ] **Multi-stage build (recommended)**
  - Stage 1: Install all dependencies, build TypeScript.
  - Stage 2: Copy only `dist/` and production dependencies for a smaller image.
- [ ] **Install dependencies**
  - Install both dev and prod dependencies for build, then prune dev dependencies for runtime.
- [ ] **Build step**
  - Run `npm run build` to generate `dist/`.
- [ ] **Entrypoint**
  - Set `CMD` to run the built JS file (e.g., `node dist/start.js`).
- [ ] **Environment variables**
  - Ensure all required env vars are documented and passed in via Render.

## 4. **Render Deployment Alignment**

- [ ] **Check Render build & start commands**
  - Build command: `npm run build --prefix backend`
  - Start command: `npm run start --prefix backend` or `node dist/start.js`
- [ ] **Environment variables**
  - List all required env vars in Render dashboard.
- [ ] **Persistent storage & secrets**
  - Ensure any required volumes or secrets are configured in Render.

## 5. **Testing & Validation**

- [ ] **Local Docker build & run**
  - Build the Docker image locally and run it to ensure it starts correctly.
  - Check logs for errors and confirm API endpoints respond.
- [ ] **Automated tests**
  - Run the full test suite inside the Docker container.
- [ ] **Lint & format**
  - Run `npm run lint` and `npm run format` as part of CI/CD.

## 6. **Documentation & Clean-up**

- [ ] **Update deployment documentation**
  - Document the new Dockerfile, build, and deployment process in
    `docs/deploy-backend-to-render.md`.
- [ ] **Remove obsolete files**
  - Delete any old `.js` files, legacy Dockerfiles, or unused scripts.
- [ ] **Commit & push**
  - Ensure all changes are committed with a clear message.
  - Push to the appropriate branch and open a PR if needed.

---

## **Checklist Table**

| Step | Description                 | Status |
| ---- | --------------------------- | ------ |
| 1    | Project audit & inventory   | [ ]    |
| 2    | Build process validation    | [ ]    |
| 3    | Dockerfile redesign         | [ ]    |
| 4    | Render deployment alignment | [ ]    |
| 5    | Testing & validation        | [ ]    |
| 6    | Documentation & clean-up    | [ ]    |

---

## **Notes**

- This plan assumes a clean, modern TypeScript backend with no legacy JS.
- All steps should be validated before moving to the next.
- If any step fails, log findings and update the plan before proceeding.
