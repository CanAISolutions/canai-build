import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import supabase from './supabase/client.js';
import Sentry from './services/instrument.js';

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

dotenv.config();

export function createApp() {
  const app = express();

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
        const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);
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

  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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
      environment: process.env.NODE_ENV || 'development',
    });
  });

  app.get('/health', async (req, res) => {
    try {
      let dbStatus = 'unknown';
      try {
        const { error } = await supabase
          .from('prompt_logs')
          .select('id')
          .limit(1);
        dbStatus = error ? 'unhealthy' : 'healthy';
      } catch (err) {
        dbStatus = 'unhealthy';
      }
      const status = dbStatus === 'healthy' ? 'healthy' : 'degraded';
      res.status(200).json({
        status,
        supabase: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
      });
    } catch (err) {
      res.status(200).json({
        status: 'degraded',
        supabase: 'unhealthy',
        error: err.message,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
      });
    }
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

  // 404 handler
  app.all('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  });
  return app;
}
