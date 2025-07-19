#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// Basic middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (matching your server's /healthz)
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CanAI Test Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase: 'mock',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
      hume: process.env.HUME_API_KEY ? 'configured' : 'missing',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CanAI Test Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CanAI Test Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/healthz`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📍 Root endpoint: http://localhost:${PORT}/`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
