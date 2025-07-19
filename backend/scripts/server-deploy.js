import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

export function createApp() {
  const app = express();

  // Startup log for version and environment
  console.log(
    `CanAI Backend version: 0.0.0 (${process.env['NODE_ENV'] || 'development'})`
  );

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
    let checks = {};
    let performance = {};

    try {
      checks = {
        supabase: process.env['SUPABASE_URL'] ? 'configured' : 'missing',
        stripe: process.env['STRIPE_SECRET_KEY'] ? 'configured' : 'missing',
        makecom: process.env['MAKECOM_API_KEY'] ? 'configured' : 'missing',
        posthog: process.env['POSTHOG_API_KEY'] ? 'configured' : 'missing',
        sentry: process.env['SENTRY_DSN'] ? 'configured' : 'missing',
        hume: process.env['HUME_API_KEY'] ? 'configured' : 'missing',
        memberstack: process.env['MEMBERSTACK_API_KEY']
          ? 'configured'
          : 'missing',
        redis: process.env['REDIS_URL'] ? 'configured' : 'missing',
      };

      const responseTime = Date.now() - startTime;
      performance = {
        responseTimeMs: responseTime,
        withinSLA: responseTime < 100,
      };

      const allConfigured = Object.entries(checks).every(
        ([k, v]) => v === 'configured'
      );
      const status = allConfigured ? 'healthy' : 'degraded';

      res.status(200).json({
        status,
        version: process.env['APP_VERSION'] || '0.0.0',
        checks,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        performance,
      });
    } catch (err) {
      const responseTime = Date.now() - startTime;
      performance = { responseTimeMs: responseTime };

      res.status(200).json({
        status: 'degraded',
        version: process.env['APP_VERSION'] || '0.0.0',
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

  // ==============================================
  // API Routes (Placeholder implementations for deployment)
  // ==============================================

  // Emotional Analysis
  app.post('/api/v1/emotional-analysis', (req, res) => {
    res.status(200).json({
      message: 'Emotional analysis endpoint - requires Supabase configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // Stripe
  app.post('/api/v1/stripe/create-checkout-session', (req, res) => {
    res.status(200).json({
      message: 'Stripe checkout endpoint - requires Stripe configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth
  app.post('/api/v1/auth/verify', (req, res) => {
    res.status(200).json({
      message:
        'Auth verification endpoint - requires Memberstack configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // Messages
  app.post('/api/v1/messages', (req, res) => {
    res.status(200).json({
      message: 'Messages endpoint - requires Supabase configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // Generate Sparks
  app.post('/api/v1/generate-sparks', (req, res) => {
    res.status(200).json({
      message: 'Generate sparks endpoint - requires AI configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // Intent Mirror
  app.post('/api/v1/intent-mirror', (req, res) => {
    res.status(200).json({
      message: 'Intent mirror endpoint - requires AI configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // Feedback
  app.post('/api/v1/feedback', (req, res) => {
    res.status(200).json({
      message: 'Feedback endpoint - requires Supabase configuration',
      status: 'degraded',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.all('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use((err, req, res, _next) => {
    // Robust CORS error detection
    if (
      err &&
      (err.code === 'CORS_NOT_ALLOWED' ||
        (typeof err.message === 'string' &&
          /CORS: Origin not allowed/i.test(err.message)))
    ) {
      return res.status(403).json({ error: 'CORS: Origin not allowed' });
    }

    // If this is a validation or parsing error, return 400
    if (
      err &&
      (err.name === 'ValidationError' || err.type === 'entity.parse.failed')
    ) {
      return res.status(400).json({
        error: 'A user-friendly error occurred. Please check your input.',
      });
    }

    // Otherwise, return 500
    res.status(500).json({
      error: 'Internal server error.',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      stack: process.env['NODE_ENV'] === 'production' ? undefined : err.stack,
      message: err instanceof Error ? err.message : String(err),
    });
  });

  return app;
}
