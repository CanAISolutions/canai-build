import * as Sentry from '@sentry/react';

export function setSentryContext(user: { id?: string }, tenantId?: string) {
  const location = window.location?.pathname || '';

  // Use modern Sentry API instead of deprecated configureScope
  Sentry.setUser({ id: user?.id || 'anonymous' });
  Sentry.setTag('session.id', sessionStorage.getItem('sessionId') || 'none');
  Sentry.setTag('route.path', location);
  Sentry.setTag('tenant.id', tenantId || 'none');
}
