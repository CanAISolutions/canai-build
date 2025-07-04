import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import supabase from './supabase/client.js';
import Sentry from './services/instrument.js';
import emotionalAnalysisRouter from './routes/emotionalAnalysis.js';
import stripeRouter from './routes/stripe.js';

dotenv.config();

const app = express();

// ==============================================
// Sentry Middleware (must be first)
// ==============================================
// console.log('Registering Sentry requestHandler at: / (global middleware)');
// app.use(Sentry.Handlers.requestHandler());
// console.log('Registering Sentry tracingHandler at: / (global middleware)');
// app.use(Sentry.Handlers.tracingHandler());

// ==============================================
// App Settings & Configuration
// ==============================================

// Trust proxy configuration for deployment environments (Render, etc.)
// Enables proper handling of X-Forwarded-* headers from reverse proxies
app.set('trust proxy', 1);

// Routing configuration for consistent URL handling
app.set('case sensitive routing', true);
app.set('strict routing', true);

// ==============================================
// Security & Middleware Stack
// ==============================================

// Security headers middleware (helmet)
console.log('Registering helmet at: / (global middleware)');
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

// CORS configuration
console.log('Registering CORS at: / (global middleware)');
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request logging middleware (morgan)
console.log('Registering morgan at: / (global middleware)');
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
console.log('Registering express.json at: / (global middleware)');
app.use(express.json({ limit: '10mb' }));
console.log('Registering express.urlencoded at: / (global middleware)');
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================================
// Routes
// ==============================================

// Health check endpoint
console.log('Registering GET /');
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CanAI Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Dedicated health endpoint for monitoring
console.log('Registering GET /health');
app.get('/health', async (req, res) => {
  try {
    // Try a simple Supabase query on a table that should always exist, fallback to degraded if error
    let dbStatus = 'unknown';
    try {
      const { error } = await supabase.from('prompt_logs').select('id').limit(1);
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

// Mount emotional analysis API
console.log('Registering /v1 emotionalAnalysisRouter');
app.use('/v1', emotionalAnalysisRouter);
app.use('/v1/stripe', stripeRouter);
console.log('Registering /v1/stripe stripeRouter');

// TODO: Add API routes
// TODO: Add authentication routes
// TODO: Add webhook routes

// ==============================================
// Error Handling (Sentry must be before other error handlers)
// ==============================================

// The Sentry error handler must be before any other error middleware and after all controllers
// console.log('Registering Sentry errorHandler at: / (global error middleware)');
// app.use(Sentry.Handlers.errorHandler());

// 404 handler
console.log('Registering 404 handler at: *');
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Optional fallthrough error handler
console.log('Registering global error handler at: /');
app.use((err, req, res, next) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

// ==============================================
// Server Configuration
// ==============================================

// Match Render's port or local testing
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CanAI Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security headers: enabled`);
  console.log(`🌐 CORS: configured`);
  console.log(
    `📝 Logging: ${process.env.NODE_ENV === 'production' ? 'combined' : 'dev'}`
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
