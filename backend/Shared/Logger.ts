import { randomUUID } from 'crypto';
import { pino } from 'pino';
import { pinoHttp } from 'pino-http';
import * as Sentry from '@sentry/node';
import type { Request, Response, NextFunction } from 'express';

const log = pino({
  level: 'debug',
  redact: ['req.headers.authorization'],
});

const httpLogger = pinoHttp({
  genReqId: () => randomUUID(),
});

export default log;
export { httpLogger };

export function addApiBreadcrumbs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${req.method} ${req.path}`,
    level: 'info',
  });
  next();
}
