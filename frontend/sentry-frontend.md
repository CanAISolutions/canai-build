# Sentry React SDK Setup Rules for Cursor

This document provides rules and examples to guide Cursor in configuring the Sentry React SDK for a
React frontend (TypeScript/JavaScript) in a full-stack application. The setup enables error
monitoring, tracing, and session replay, aligning with Task 4: Setup Sentry Error Monitoring
(Subtasks 4.1–4.4). Follow these rules to ensure robust error capture, performance monitoring,
privacy compliance, and production readiness, as per the project’s PRD goals.

## General Guidelines

- **Project Context**: React frontend (TypeScript/JavaScript) in a SaaS platform with Node.js
  backend.
- **Sentry SDK**: Use `@sentry/react` for error monitoring, tracing, and session replay.
- **Environment Variables**: Store `REACT_APP_SENTRY_DSN` in `.env` for local development and CI/CD
  secrets (e.g., GitHub Actions) for production.
- **Privacy**: Disable default PII (e.g., IP addresses) and implement custom scrubbing for GDPR
  compliance.
- **Documentation**: Update `docs/project-structure-mapping.md` and
  `analytics-implementation-log.md` after setup.
- **TypeScript**: Prefer TypeScript syntax unless JavaScript is explicitly required. Ensure type
  safety with `@sentry/react` types.
- **CI/CD**: Automate source map uploads for production debugging using Sentry CLI and GitHub
  Actions.

## Rules for Sentry Configuration

### 1. Installation

- **Rule**: Install `@sentry/react` as a dependency using npm, yarn, or pnpm.
- **Example**:
  ```bash
  npm install --save @sentry/react
  ```
- **Notes**:
  - Verify installation by checking `package.json` for `"@sentry/react"`.
  - For TypeScript, types are included automatically.

### 2. SDK Initialization

- **Rule**: Initialize Sentry in the React entry point (`src/index.tsx` or `src/index.js`) before
  rendering the app.
- **Requirements**:
  - Use `process.env.REACT_APP_SENTRY_DSN` for the DSN, loaded from `.env` or CI/CD secrets.
  - Set `sendDefaultPii: false` to prevent sending sensitive data.
  - Enable tracing with `tracesSampleRate` (e.g., `0.1` for development, `0.01` for production).
  - Include `Sentry.browserTracingIntegration()` for route and navigation tracing.
  - Set `environment` to `process.env.NODE_ENV` to differentiate dev/prod events.
  - Optionally enable session replay with `Sentry.replayIntegration()` and privacy settings.
- **Example**:

  ```typescript
  // src/index.tsx
  import * as Sentry from '@sentry/react';
  import { createRoot } from 'react-dom/client';
  import { BrowserRouter } from 'react-router-dom';
  import App from './App';

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    environment: process.env.NODE_ENV,
    release: process.env.COMMIT_SHA || 'development',
  });

  const container = document.getElementById('app');
  const root = createRoot(container!);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  ```

- **Notes**:
  - Ensure `REACT_APP_SENTRY_DSN` is defined in `.env`:
    ```env
    REACT_APP_SENTRY_DSN=https://fd06c4fab52ad2017a0a4d54ab682e7c@o4509561217089536.ingest.us.sentry.io/4509565486039040
    ```
  - For Create React App, prefix variables with `REACT_APP_`. For Vite, use `VITE_` or check
    documentation.
  - Restart the development server after updating `.env`.
  - Add `release` for production tracking, using a CI/CD variable (e.g., `COMMIT_SHA`).

### 3. Error Monitoring

- **Rule**: Implement error boundaries and manual error capture to track UI and runtime errors.
- **Requirements**:
  - Wrap the app or key components in `Sentry.ErrorBoundary` to catch rendering errors.
  - Use `Sentry.captureException` in try-catch blocks or event handlers for custom errors.
- **Examples**:
  - **Error Boundary**:

    ```typescript
    // src/App.tsx
    import * as Sentry from '@sentry/react';
    import { BrowserRouter } from 'react-router-dom';

    function App() {
      return (
        <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
          <BrowserRouter>
            <div>Hello, World!</div>
          </BrowserRouter>
        </Sentry.ErrorBoundary>
      );
    }

    export default App;
    ```

  - **Custom Error Capture**:

    ```typescript
    // src/components/TestComponent.tsx
    import * as Sentry from '@sentry/react';

    function TestComponent() {
      const handleClick = () => {
        try {
          throw new Error('Test error');
        } catch (e) {
          Sentry.captureException(e);
        }
      };

      return <button onClick={handleClick}>Test Error</button>;
    }

    export default TestComponent;
    ```

- **Notes**:
  - Place error boundaries strategically (e.g., at the app level or per major component).
  - Test error capture with intentional errors (see verification below).

### 4. Tracing

- **Rule**: Configure tracing for page loads, navigation, and custom actions (e.g., button clicks,
  API calls).
- **Requirements**:
  - Use `Sentry.browserTracingIntegration()` for automatic page load/navigation tracing.
  - For React Router, add `reactRouterV6BrowserTracingIntegration` (or v5 equivalent).
  - Create custom spans with `Sentry.startSpan` for meaningful actions (e.g., UI clicks, API calls).
  - Add attributes to spans for context (e.g., config, metrics).
- **Examples**:
  - **React Router Tracing**:

    ```typescript
    // src/index.tsx
    import * as Sentry from '@sentry/react';
    import * as ReactRouter from 'react-router-dom';
    import { createRoot } from 'react-dom/client';
    import App from './App';

    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      sendDefaultPii: false,
      tracesSampleRate: 0.1,
      integrations: [
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
          useLocation: ReactRouter.useLocation,
          useNavigationType: ReactRouter.useNavigationType,
          createRoutesFromChildren: ReactRouter.createRoutesFromChildren,
          matchRoutes: ReactRouter.matchRoutes,
        }),
      ],
      environment: process.env.NODE_ENV,
    });

    const container = document.getElementById('app');
    const root = createRoot(container!);
    root.render(
      <ReactRouter.BrowserRouter>
        <App />
      </ReactRouter.BrowserRouter>
    );
    ```

  - **Custom Span for Button Click**:

    ```typescript
    // src/components/TestComponent.tsx
    import * as Sentry from '@sentry/react';

    function TestComponent() {
      const handleTestButtonClick = () => {
        Sentry.startSpan(
          {
            op: 'ui.click',
            name: 'Test Button Click',
          },
          (span) => {
            span.setAttribute('config', 'some config');
            span.setAttribute('metric', 'some metric');
            console.log('Button clicked');
          }
        );
      };

      return (
        <button type="button" onClick={handleTestButtonClick}>
          Test Sentry
        </button>
      );
    }

    export default TestComponent;
    ```

  - **Custom Span for API Call**:

    ```typescript
    // src/api.ts
    import * as Sentry from '@sentry/react';

    export async function fetchUserData(userId: string) {
      return Sentry.startSpan(
        {
          op: 'http.client',
          name: `GET /api/users/${userId}`,
        },
        async () => {
          const response = await fetch(`/api/users/${userId}`);
          const data = await response.json();
          return data;
        }
      );
    }
    ```

- **Notes**:
  - Use meaningful `op` and `name` values for spans (e.g., `ui.click`, `http.client`).
  - Keep `tracesSampleRate` low in production (e.g., `0.01`) to minimize overhead.

### 5. Session Replay

- **Rule**: Optionally enable session replay for debugging with privacy safeguards.
- **Requirements**:
  - Use `Sentry.replayIntegration()` with `maskAllText` and `blockAllMedia` for GDPR compliance.
  - Set `replaysSessionSampleRate` and `replaysOnErrorSampleRate` to control replay frequency.
- **Example**:

  ```typescript
  // src/index.tsx
  import * as Sentry from '@sentry/react';

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    environment: process.env.NODE_ENV,
  });
  ```

- **Notes**:
  - Adjust sample rates to balance debugging and privacy.
  - Replays appear in Sentry’s **Replays** tab.

### 6. Logging (Optional)

- **Rule**: Configure Sentry to capture console logs as events for enhanced observability.
- **Requirements**:
  - Enable logging with `_experiments: { enableLogs: true }`.
  - Use `Sentry.consoleLoggingIntegration` to capture `log`, `error`, and `warn` levels.
  - Use `logger.fmt` for structured logs with variables.
- **Example**:

  ```typescript
  // src/index.tsx
  import * as Sentry from '@sentry/react';

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.consoleLoggingIntegration({ levels: ['log', 'error', 'warn'] }),
    ],
    _experiments: { enableLogs: true },
    environment: process.env.NODE_ENV,
  });
  ```

  ```typescript
  // src/components/TestComponent.tsx
  import * as Sentry from '@sentry/react';

  function TestComponent() {
    const { logger } = Sentry;
    const userId = '123';

    logger.debug(logger.fmt`Cache miss for user: ${userId}`);
    logger.info('Updated profile', { profileId: 345 });
    logger.error('Failed to process payment', { orderId: 'order_123', amount: 99.99 });

    return <div>Test Component</div>;
  }
  ```

- **Notes**:
  - Logs appear in Sentry’s **Issues** or **Logs** tab.
  - Use structured data for better debugging.

### 7. Source Map Upload

- **Rule**: Automate source map uploads in CI/CD for readable production stack traces.
- **Requirements**:
  - Install `@sentry/cli` as a dev dependency.
  - Generate source maps during build (e.g., Create React App, Vite).
  - Use Sentry CLI in CI/CD (e.g., GitHub Actions) to upload source maps.
- **Example**:
  ```bash
  npm install @sentry/cli --save-dev
  ```
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  on:
    push:
      branches: [main]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Set up Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
        - run: npm install
        - run: npm run build
        - name: Upload source maps to Sentry
          env:
            SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
            SENTRY_DSN: ${{ secrets.REACT_APP_SENTRY_DSN }}
          run: |
            npx @sentry/cli releases new $GITHUB_SHA
            npx @sentry/cli releases files $GITHUB_SHA upload-sourcemaps ./build --url-prefix '~/build'
            npx @sentry/cli releases finalize $GITHUB_SHA
  ```
- **Notes**:
  - Create a `SENTRY_AUTH_TOKEN` in Sentry (**Settings** > **Account** > **API** > **Auth Tokens**).
  - Add `SENTRY_AUTH_TOKEN` and `REACT_APP_SENTRY_DSN` as GitHub Actions secrets.
  - For Vite, enable source maps in `vite.config.ts`:
    ```typescript
    export default defineConfig({
      build: {
        sourcemap: true,
      },
    });
    ```

### 8. Verification

- **Rule**: Test Sentry setup by triggering an intentional error.
- **Example**:

  ```typescript
  // src/components/TestComponent.tsx
  function TestComponent() {
    return (
      <button
        onClick={() => {
          throw new Error('This is your first error!');
        }}
      >
        Break the world
      </button>
    );
  }

  export default TestComponent;
  ```

- **Steps**:
  1. Run the app: `npm start`.
  2. Click the button to trigger the error.
  3. Check Sentry dashboard (**Projects** > [Your Project] > **Issues**) for the error.
  4. Verify performance data in **Performance** tab.
- **Notes**:
  - If no events appear, check `REACT_APP_SENTRY_DSN`, initialization order, and internet
    connection.

### 9. Documentation

- **Rule**: Document the Sentry setup in `docs/project-structure-mapping.md` and
  `analytics-implementation-log.md`.
- **Examples**:
  - `docs/project-structure-mapping.md`:

    ```markdown
    ## Sentry Frontend Configuration

    - **File**: `src/index.tsx`
    - **Purpose**: Initializes Sentry React SDK for error monitoring, tracing, and session replay.
    - **Environment Variables**:
      - `REACT_APP_SENTRY_DSN`: Stored in `.env` for local dev, GitHub Actions secrets for
        production.
    ```

  - `analytics-implementation-log.md`:

    ```markdown
    ## Sentry Frontend Implementation (Task 4)

    - **Date**: 2025-06-26
    - **Details**: Initialized `@sentry/react` in `src/index.tsx` with DSN, error boundary, tracing,
      and session replay.
    - **Verification**: Test error sent to Sentry dashboard.
    ```

- **Notes**:
  - Ensure documentation reflects all configured features (e.g., tracing, replay).

## Common Pitfalls to Avoid

- **Incorrect DSN**: Verify `REACT_APP_SENTRY_DSN` matches the Sentry project’s DSN.
- **PII Exposure**: Always set `sendDefaultPii: false` and configure PII scrubbing in Subtask 4.2.
- **Performance Overhead**: Use low `tracesSampleRate` and `replaysSessionSampleRate` in production.
- **Missing Source Maps**: Ensure build generates source maps and CI/CD uploads them.
- **Initialization Order**: Initialize Sentry before rendering the app.
- **TypeScript Issues**: Use `import` for ESM and ensure types are resolved.

## Additional Notes for Cursor

- **Code Suggestions**:
  - Suggest Sentry imports at the top of files: `import * as Sentry from '@sentry/react';`.
  - Autocomplete `Sentry.init` with the baseline configuration above.
  - Recommend error boundaries and custom spans in component and API code.
- **Error Handling**:
  - Wrap risky operations in try-catch with `Sentry.captureException`.
  - Suggest error boundaries for new components.
- **Tracing**:
  - Propose custom spans for button clicks (`op: 'ui.click'`) and API calls (`op: 'http.client'`).
  - Include React Router tracing for routing-heavy apps.
- **Privacy**:
  - Flag PII-related code and suggest `beforeSend` for scrubbing (to be implemented in Subtask 4.2).
- **Documentation**:
  - Prompt to update `docs/project-structure-mapping.md` and `analytics-implementation-log.md` after
    changes.
