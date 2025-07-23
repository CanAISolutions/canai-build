import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  code?: string;
  type?: string;
}
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import supabase from './supabase/client.js';
import Sentry from './services/instrument.js';
import { Redis } from 'ioredis';
import { readFileSync } from 'fs';
import { retryMiddleware } from './middleware/retry.js';

import emotionalAnalysisRouter from './routes/emotionalAnalysis.js';
import stripeRouter from './routes/stripe.js';
import authRouter from './routes/auth.js';
import messagesRouter from './routes/messages.js';
import validateInputRouter from './routes/validateInput.js';
import generateSparksRouter from './routes/generateSparks.js';
import saveProgressRouter from './routes/saveProgress.js';
import intentMirrorRouter from './routes/intentMirror.js';
import requestRevisionRouter from './routes/requestRevision.js';
import sparkSplitRouter from './routes/sparkSplit.js';
import feedbackRouter from './routes/feedback.js';
import cacheRouter from './routes/cache.js';

let pkg = { version: '0.0.0' };
try {
  pkg = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
  );
} catch (err) {
  console.warn(
    '[Startup] Could not read package.json:',
    err instanceof Error ? err.message : String(err)
  );
}

dotenv.config();

export function createApp() {
  const app = express();

  // Startup log for version and environment
  console.log(
    `CanAI Backend version: ${pkg.version} (${process.env['NODE_ENV'] || 'development'})`
  );

  // ==============================================
  // Sentry Middleware (must be first)
  // ==============================================
  // app.use(Sentry.Handlers.requestHandler());
  // app.use(Sentry.Handlers.tracingHandler());

  // ==============================================
  // App Settings & Configuration
  // ==============================================
  app.set('trust proxy', 1);
  app.set('case sensitive routing', true);
  app.set('strict routing', true);

  // ==============================================
  // Security & Middleware Stack
  // ==============================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  function parseOrigins(origins) {
    if (!origins) return ['http://localhost:3000', 'http://localhost:5173'];
    if (Array.isArray(origins)) return origins;
    return origins
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
  }

  app.use(
    cors({
      origin: function (origin, callback) {
        const allowedOrigins = parseOrigins(process.env['CORS_ORIGIN']);
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS: Origin not allowed: ' + origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Authorization',
        'x-memberstack-token',
        'x-make-signature',
        'x-make-timestamp',
        'Content-Type',
        'X-Requested-With',
      ],
      maxAge: 86400,
    })
  );

  app.use(
    morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev')
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==============================================
  // Retry Middleware (apply to all routes)
  // ==============================================
  app.use(
    retryMiddleware({
      maxAttempts: 3,
      baseDelay: 500,
      multiplier: 2,
      maxDelay: 5000,
      timeout: 10000,
    })
  );

  // ==============================================
  // Routes
  // ==============================================
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'CanAI Backend Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] || 'development',
    });
  });

  app.get('/health', async (req, res) => {
    const startTime = Date.now();
    let dbStatus = 'unknown';
    let redisStatus = 'fallback';
    let checks = {};
    let performance = {};
    try {
      try {
        const { error } = await supabase
          .from('prompt_logs')
          .select('id')
          .limit(1);
        dbStatus = error ? 'unhealthy' : 'healthy';
      } catch (err) {
        dbStatus = 'unhealthy';
      }
      if (
        process.env['REDIS_URL'] &&
        process.env['REDIS_URL'] !== 'your_redis_url'
      ) {
        try {
          const redis = new Redis(process.env['REDIS_URL'], {
            connectTimeout: 1000,
          });
          await redis.ping();
          redisStatus = 'connected';
          await redis.quit();
        } catch (err) {
          redisStatus = 'unavailable';
          if (Sentry && Sentry.captureException)
            Sentry.captureException(err, {
              extra: { service: 'redis', context: 'health-check' },
            });
          // Structured logging: log Redis connection errors to Sentry (see logging guidelines)
          Sentry.captureMessage?.(
            '[Health] Redis connection failed: ' +
              (err instanceof Error ? err.message : String(err)),
            'warning'
          );
        }
      } else {
        redisStatus = 'fallback';
      }
      checks = {
        supabase: dbStatus,
        stripe: process.env['STRIPE_SECRET_KEY'] ? 'configured' : 'missing',
        makecom: process.env['MAKECOM_API_KEY'] ? 'configured' : 'missing',
        posthog: process.env['POSTHOG_API_KEY'] ? 'configured' : 'missing',
        sentry: process.env['SENTRY_DSN'] ? 'configured' : 'missing',
        hume: process.env['HUME_API_KEY'] ? 'configured' : 'missing',
        memberstack: process.env['MEMBERSTACK_API_KEY']
          ? 'configured'
          : 'missing',
        redis: redisStatus,
      };
      const responseTime = Date.now() - startTime;
      performance = {
        responseTimeMs: responseTime,
        withinSLA: responseTime < 100,
      };
      const allConfigured = Object.entries(checks).every(([k, v]) =>
        k === 'supabase'
          ? v === 'healthy'
          : k === 'redis'
            ? true
            : v === 'configured'
      );
      const status = allConfigured ? 'healthy' : 'degraded';
      res.status(200).json({
        status,
        version: process.env['APP_VERSION'] || pkg.version || '0.0.0',
        checks,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        performance,
      });
    } catch (err) {
      const responseTime = Date.now() - startTime;
      performance = { responseTimeMs: responseTime };
      checks = Object.keys(checks).length
        ? checks
        : { supabase: dbStatus, redis: redisStatus };
      res.status(200).json({
        status: 'degraded',
        version: process.env['APP_VERSION'] || pkg.version || '0.0.0',
        checks,
        error: err instanceof Error ? err.message : String(err),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        performance,
      });
    }
  });

  // Add /healthz endpoint for Render health checks
  app.get('/healthz', async (req, res) => {
    // Proxy to /health logic
    req.url = '/health';
    app._router.handle(req, res);
  });

  app.use('/v1', emotionalAnalysisRouter);
  app.use('/v1/stripe', stripeRouter);
  app.use('/v1/auth', authRouter);
  app.use('/v1/messages', messagesRouter);
  app.use('/v1', validateInputRouter);
  app.use('/v1', generateSparksRouter);
  app.use('/v1', saveProgressRouter);
  app.use('/v1', intentMirrorRouter);
  app.use('/v1', requestRevisionRouter);
  app.use('/v1', sparkSplitRouter);
  app.use('/v1', feedbackRouter);
  app.use('/v1/cache', cacheRouter);

  // 404 handler
  app.all('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const customError = err as CustomError;
    if (
      process.env['NODE_ENV'] === 'test' ||
      process.env['NODE_ENV'] === 'development'
    ) {
      Sentry.captureException?.(customError, {
        extra: { context: 'global error handler' },
      });
    }
    // Robust CORS error detection: check error code or use regex (see test plan)
    if (
      customError &&
      (customError.code === 'CORS_NOT_ALLOWED' ||
        (typeof customError.message === 'string' &&
          /CORS: Origin not allowed/i.test(customError.message)))
    ) {
      Sentry.captureMessage?.('[CORS ERROR] ' + customError.message, 'warning');
      return res.status(403).json({ error: 'CORS: Origin not allowed' });
    }
    // If this is a validation or parsing error, return 400
    if (
      customError &&
      (customError.name === 'ValidationError' ||
        customError.type === 'entity.parse.failed')
    ) {
      return res.status(400).json({
        error: 'A user-friendly error occurred. Please check your input.',
      });
    }
    // Otherwise, return 500
    res.status(500).json({
      error: 'Internal server error.',
      code: customError.code || 'INTERNAL_SERVER_ERROR',
      stack:
        process.env['NODE_ENV'] === 'production'
          ? undefined
          : customError.stack,
      message: customError.message || String(customError),
    });
  });
  return app;
}
