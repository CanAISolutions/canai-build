import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { Request, Response, NextFunction } from 'express';

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Set this in your .env file
  environment: process.env.SENTRY_ENV || 'development',
  sendDefaultPii: false, // Privacy: don't send PII by default
  tracesSampleRate: 0.1, // Adjust for production
  profilesSampleRate: 0.1, // Adjust for production
  integrations: [nodeProfilingIntegration()],
  release: process.env.npm_package_version, // Optional: tag with version
  beforeSend(event) {
    // Scrub PII from event.request.data and event.contexts.profile
    if (event.request?.data) {
      ['email', 'password'].forEach(key => {
        if (event.request.data[key]) event.request.data[key] = '[REDACTED]';
      });
    }
    if (event.contexts?.profile) {
      ['email', 'password'].forEach(key => {
        if (event.contexts.profile[key])
          event.contexts.profile[key] = '[REDACTED]';
      });
    }
    return event;
  },
});

// Global error handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', err => {
  Sentry.captureException(err);
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', reason => {
  Sentry.captureException(reason);
  console.error('Unhandled Rejection:', reason);
});

// Sentry context enrichment helper
export function setSentryContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  Sentry.withScope(scope => {
    // Use real user/session/tenant data if available
    scope.setUser({ id: req.user?.id || 'anonymous' });
    scope.setTag('session.id', req.session?.id || 'none');
    scope.setTag('endpoint.method', req.method);
    scope.setTag('endpoint.path', req.path);
    scope.setTag('tenant.id', req.tenant?.id || 'none');
    next();
  });
}

export default Sentry;
