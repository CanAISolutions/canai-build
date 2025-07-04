import { randomUUID } from 'crypto';
import pino from 'pino';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';

const log = pino({
  level: 'debug',
  redact: ['req.headers.authorization'],
});

const httpLogger = pinoHttp({ logger: log, genReqId: () => randomUUID });

export default log;
export { httpLogger };

export function addApiBreadcrumbs(req, res, next) {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${req.method} ${req.path}`,
    level: 'info',
  });
  next();
}
