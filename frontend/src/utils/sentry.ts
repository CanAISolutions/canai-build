import * as Sentry from '@sentry/react';

export function setSentryContext(user: { id?: string }, tenantId?: string) {
  const location = window.location?.pathname || '';
  Sentry.configureScope(scope => {
    scope.setUser({ id: user?.id || 'anonymous' });
    scope.setTag('session.id', sessionStorage.getItem('sessionId') || 'none');
    scope.setTag('route.path', location);
    scope.setTag('tenant.id', tenantId || 'none');
  });
}
