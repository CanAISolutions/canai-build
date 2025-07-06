import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MemberstackProvider } from '@memberstack/react';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Sentry v7+ initialization (no BrowserTracing or @sentry/tracing)
Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'] || import.meta.env['SENTRY_DSN'],
  environment:
    import.meta.env['VITE_SENTRY_ENV'] ||
    import.meta.env['SENTRY_ENV'] ||
    'development',
  tracesSampleRate: import.meta.env['MODE'] === 'production' ? 0.2 : 1.0,
  release: import.meta.env['VITE_APP_VERSION'] || 'dev',
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
createRoot(rootElement).render(
  <ErrorBoundary>
    <MemberstackProvider
      config={{
        publicKey:
          import.meta.env['VITE_MEMBERSTACK_PUBLIC_KEY'] ??
          (() => {
            throw new Error('Missing VITE_MEMBERSTACK_PUBLIC_KEY');
          })(),
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MemberstackProvider>
  </ErrorBoundary>
);

// NOTE: To suppress React Router v7 future flag warnings, set the following in your router config (e.g., App.tsx):
// future: { v7_startTransition: true, v7_relativeSplatPath: true }
