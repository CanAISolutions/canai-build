import { createApp } from './server.js';

const app = createApp();

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

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
