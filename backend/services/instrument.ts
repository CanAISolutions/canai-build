import * as Sentry from '@sentry/node';

if (process.env['NODE_ENV'] !== 'test') {
  Sentry.init({
    dsn: process.env['SENTRY_DSN'] || '',
    sendDefaultPii: true,
  });
}

export default Sentry;
