import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

export default async function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  try {
    await rateLimiter.consume(ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
}
