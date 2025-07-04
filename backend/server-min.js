import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import supabase from './supabase/client.js';
import emotionalAnalysisRouter from './routes/emotionalAnalysis.js';
import stripeRouter from './routes/stripe.js';
import HumeService from './services/hume.js';
import Sentry from './services/instrument.js';
import validate from './middleware/validation.js';
import rateLimit from './middleware/rateLimit.js';
import auth from './middleware/auth.js';
dotenv.config();
Sentry.init({
  dsn: 'https://bb62698f685b49ed1217b8e849aebdde@o4509561217089536.ingest.us.sentry.io/4509565382688768',
  sendDefaultPii: true,
});
const app = express();
const humeService = new HumeService();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
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
app.use(morgan('dev'));
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use('/v1', emotionalAnalysisRouter);
app.use('/v1/stripe', stripeRouter);
app.use(Sentry.Handlers.errorHandler());
app.get('/', async (req, res) => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    res.send('OK with Supabase, Hume, and Sentry');
  } catch (err) {
    res.status(500).send('Supabase error: ' + err.message);
  }
});
app.get('/test-validation', validate({ body: {} }), (req, res) => {
  res.send('Validation middleware works');
});
app.get('/test-rate-limit', rateLimit, (req, res) => {
  res.send('Rate limit middleware works');
});
app.get('/test-auth', auth, (req, res) => {
  res.send('Auth middleware works');
});
app.listen(3000, () => console.log('Minimal server running'));