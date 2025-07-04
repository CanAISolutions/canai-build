import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { serializeError } from 'serialize-error';
import bootstrapAsyncDependencies from './Shared/BootstrapAsyncDepdencies';
import * as Sentry from '@sentry/node';
import { setSentryContext } from './instrument';
import { addApiBreadcrumbs } from './Shared/Logger';

import log, { httpLogger } from './Shared/Logger';

const logger = log.child({ module: startup.name });

export default async function startup() {
  process.on('uncaughtException', err =>
    logger.fatal(
      serializeError(err),
      'an "uncaughtException" was thrown and globally handled'
    )
  );
  process.on('unhandledRejection', err =>
    logger.fatal(
      serializeError(err),
      'an "unhandledRejection" was thrown and globally handled'
    )
  );
  const app = express();

  // Sentry test route
  app.get('/test-sentry', async (req, res) => {
    // Start a Sentry transaction for this request
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: 'GET /test-sentry',
    });
    Sentry.getCurrentHub().configureScope(scope => {
      scope.setSpan(transaction);
    });
    try {
      // Example: Simulate a DB or external API call with a Sentry span
      const span = transaction.startChild({
        op: 'db.query',
        description: 'Simulated DB query',
      });
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate latency
      span.finish();

      throw new Error('Sentry test error!');
    } catch (e) {
      Sentry.captureException(e);
      res.status(500).send('Test error sent to Sentry');
    } finally {
      transaction.finish();
    }
  });

  logger.debug('bootstrapping app');
  app.use(httpLogger);
  app.set('logger', log);
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(json());
  app.use(helmet.hidePoweredBy());

  // Apply Sentry context and breadcrumbs to all routes for error tracking
  app.use(setSentryContext);
  app.use(addApiBreadcrumbs);

  await bootstrapAsyncDependencies(app);

  // Sentry error handler middleware (v8+)
  app.use(Sentry.expressErrorHandler());

  return app;
}
