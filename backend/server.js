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

// Parse comma-separated origins from env
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
      // Allow requests with no origin (like mobile apps, curl, etc.)
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
    maxAge: 86400, // 24 hours for preflight cache
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

// Mount emotional analysis API
console.log('Registering /v1 emotionalAnalysisRouter');
app.use('/v1', emotionalAnalysisRouter);
app.use('/v1/stripe', stripeRouter);
console.log('Registering /v1/stripe stripeRouter');

// Mount authentication API
console.log('Registering /v1/auth authRouter');
app.use('/v1/auth', authRouter);

// Mount messages API
console.log('Registering /v1/messages messagesRouter');
app.use('/v1', messagesRouter);

// Mount validate input API
console.log('Registering /v1 validateInputRouter');
app.use('/v1', validateInputRouter);

// Mount generate sparks API
console.log('Registering /v1 generateSparksRouter');
app.use('/v1', generateSparksRouter);

// Mount save progress API
console.log('Registering /v1 saveProgressRouter');
app.use('/v1', saveProgressRouter);

// Mount intent mirror API
console.log('Registering /v1 intentMirrorRouter');
app.use('/v1', intentMirrorRouter);

// Mount request revision API
console.log('Registering /v1 requestRevisionRouter');
app.use('/v1', requestRevisionRouter);

// Mount spark split API
console.log('Registering /v1 sparkSplitRouter');
app.use('/v1', sparkSplitRouter);

// Mount feedback API
console.log('Registering /v1 feedbackRouter');
app.use('/v1', feedbackRouter);

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
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
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
