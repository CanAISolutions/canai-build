# Backend Deployment Audit & Recovery Plan

## 1. Executive Summary

This audit identifies the root causes of the backend startup failure following the recent JavaScript
to TypeScript migration. The primary issues are **incorrect module import paths** in TypeScript
files, a **misconfigured `tsconfig.json`**, and several **TypeScript-related errors** within the
application code.

The backend cannot start in its current state because the TypeScript compiler (`ts-node`) cannot
resolve the modules needed to bootstrap the server. This document provides a step-by-step plan to
rectify these issues, enabling a successful local launch and preparing for deployment.

## 2. Core Issues Analysis

### Issue #1: Incorrect Module Imports (Critical)

The most significant issue is the use of `.js` extensions in `import` statements within your
TypeScript files.

- **File:** `backend/start.ts`
- **Code:** `import { createApp } from './server.js';`
- **File:** `backend/server.ts`
- **Code:** `import supabase from './supabase/client.js';` (and many others)

**Problem:** When using `ts-node` to run your application, the TypeScript files are compiled in
memory. The import paths should reference other TypeScript files using a `.ts` extension or no
extension at all, relying on the compiler's module resolution. The `.js` extension tells the
TypeScript compiler to look for a JavaScript file that doesn't exist yet, causing the import to
fail.

### Issue #2: `tsconfig.json` Misconfiguration

The `tsconfig.json` file has several issues that prevent a clean and reliable build.

1.  **Overly Restrictive `include` Paths:** The `"include"` array is manually listing many
    individual directories and files. It is missing `'./'` or `'src'` which means it may not be
    picking up all necessary files, including `start.ts` and `server.ts` if they weren't explicitly
    listed.
2.  **Loosened Type Strictness:** The comment `// TEMP PATCH: Loosened TypeScript strictness...` and
    the disabled strict flags (`"strict": false`, `"noImplicitAny": false`, etc.) indicate that the
    migration was not fully completed. This hides underlying type errors that can cause runtime
    bugs.

### Issue #3: TypeScript Errors in `server.ts`

The main server file (`server.ts`) contains code that will cause TypeScript compilation errors.

- **Missing Type Imports:** The global error handler at the end of the file uses the types
  `Request`, `Response`, and `NextFunction` without importing them from `express`.
  ```typescript
  // Missing import: import { Request, Response, NextFunction } from 'express';
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    // ...
  });
  ```

### Issue #4: Ambiguous Startup Scripts

The `package.json` file contains multiple, potentially conflicting, scripts for starting the server.

- `"start:dev": "node start.js"`: This script runs a JavaScript file and is likely a remnant from
  before the migration.
- `"backend": "ts-node start.ts"`: This is the **correct** script for running the backend in a
  TypeScript development environment.

It is crucial to use the `backend` script to ensure `ts-node` compiles and runs your TypeScript
code.

## 3. Step-by-Step Recovery Plan

Follow these steps precisely to resolve the issues and start your backend server.

### Step 1: Correct Module Imports

You must change the file extensions in your import statements from `.js` to `.ts`.

**1. In `backend/start.ts`:**

- **Change:** `import { createApp } from './server.js';`
- **To:** `import { createApp } from './server.ts';`

**2. In `backend/server.ts`:**

- **Change all imports ending in `.js` to end in `.ts`.**
- **Example:**
  - `import supabase from './supabase/client.js';` -> `import supabase from './supabase/client.ts';`
  - `import emotionalAnalysisRouter from './routes/emotionalAnalysis.js';` ->
    `import emotionalAnalysisRouter from './routes/emotionalAnalysis.ts';`
  - ...and so on for all other imports.

### Step 2: Fix `tsconfig.json`

Update the `include` property in `backend/tsconfig.json` to correctly discover all TypeScript files.

- **Change:** The existing `include` array.
- **To:** `json     "include": [         "**/*.ts"     ],     ` This will ensure the compiler picks
  up every `.ts` file within the `backend` directory. The existing `exclude` array will correctly
  prevent it from looking inside `node_modules`, `dist`, etc.

### Step 3: Resolve TypeScript Errors in `server.ts`

Add the missing type imports to `backend/server.ts`.

- **At the top of `backend/server.ts`, add this line:**
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  ```

### Step 4: Use the Correct Command to Start the Server

Once the code changes are made, run the backend using the correct npm script.

- **In your terminal, from the `C:\Backups\canai-build\backend` directory, run:**
  ```bash
  npm run backend
  ```
  _or from the root `C:\Backups\canai-build` directory:_
  ```bash
  npm run backend --workspace=backend
  ```

This command executes `ts-node start.ts`, which will compile and run your TypeScript application.

## 4. Conclusion

By following this recovery plan, you will resolve the critical import and configuration errors that
are preventing your backend from starting. After these changes, the `npm run backend` command should
successfully launch your server locally.

It is highly recommended to plan a follow-up task to re-enable the strict TypeScript settings in
`tsconfig.json` and fix any resulting type errors. This will improve code quality and prevent future
runtime issues.
