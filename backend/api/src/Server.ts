import './instrument';
import * as Sentry from '@sentry/node';
import { serializeError } from 'serialize-error';

import startup from './App';
import log from './Shared/Logger';

const logger = log.child({ module: 'server' });

// Test Sentry connection (remove in production)
if (process.env.SENTRY_TEST_ERROR === 'true') {
  Sentry.captureException(new Error('Sentry test error from Server.ts'));
}

startup()
  .then(app => {
    // Add test route for Sentry validation
    app.get('/test-error', (_req, _res) => {
      throw new Error('Backend test error');
    });
    const port = 5000;
    try {
      const server = app.listen(port, () => {
        if (!server) logger.fatal('error starting the server');
        logger.info({ port }, 'server listening');
      });
    } catch (err) {
      logger.fatal(serializeError(err), '💣');
    }
  })
  .catch(e => {
    logger.fatal(serializeError(e), 'bootstrapping the server failed');
  });
