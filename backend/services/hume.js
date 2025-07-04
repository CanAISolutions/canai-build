import dotenv from 'dotenv';
dotenv.config();

import supabase from '../supabase/client.js';
import { hume, createHume } from '@ai-sdk/hume';
import PostHog from 'posthog-js';
import HumeCircuitBreaker from '../middleware/hume.js';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import EmotionalScorer from './emotionalScoring.js';
import GPT4oFallbackService from './gpt4oFallback.js';
import posthog from './posthog.js';

const HUME_API_KEY = process.env.HUME_API_KEY;
if (!HUME_API_KEY) throw new Error('HUME_API_KEY is required');
console.debug('HUME_API_KEY:', HUME_API_KEY);

// Export a singleton Hume provider instance for use in the app
const humeClient = createHume({
  apiKey: process.env.HUME_API_KEY,
  // Optionally, add custom fetch for testing
});

console.debug('hume at module load:', humeClient);

class HumeService {
  constructor({ circuitBreaker, fallback } = {}) {
    this.apiKey = process.env.HUME_API_KEY;
    this.endpoint = process.env.HUME_API_ENDPOINT || 'https://api.hume.ai/v1';
    this.timeout = parseInt(process.env.HUME_TIMEOUT, 10) || 5000;
    this.posthog = posthog;
    this.client = humeClient;
    this.circuitBreaker = circuitBreaker || new HumeCircuitBreaker();

    // Initialize rate limiter with fallback for Redis failures
    this.initializeRateLimiter();

    this.scorer = new EmotionalScorer();
    this.fallback = fallback || new GPT4oFallbackService();
  }

  initializeRateLimiter() {
    try {
      // Only use Redis rate limiter if Redis URL is properly configured
      if (process.env.REDIS_URL && process.env.REDIS_URL !== 'your_redis_url') {
        const redisClient = new Redis(process.env.REDIS_URL);

        // Handle Redis connection errors gracefully
        redisClient.on('error', err => {
          console.warn(
            'Redis connection error, falling back to memory rate limiter:',
            err.message
          );
          this.useMemoryRateLimiter();
        });

        this.rateLimiter = new RateLimiterRedis({
          storeClient: redisClient,
          points: parseInt(process.env.HUME_RATE_LIMIT, 10) || 100,
          duration: 60, // per minute
        });
      } else {
        // Fallback to memory-based rate limiter
        this.useMemoryRateLimiter();
      }
    } catch (error) {
      console.warn(
        'Failed to initialize Redis rate limiter, using memory fallback:',
        error.message
      );
      this.useMemoryRateLimiter();
    }
  }

  useMemoryRateLimiter() {
    // Simple in-memory rate limiter as fallback
    const requests = new Map();
    let counter = 0; // To ensure unique keys for rapid calls

    this.rateLimiter = {
      requests,
      consume: (points = 1) => {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window

        // Clean old entries
        for (const [time] of requests) {
          if (time < windowStart) {
            requests.delete(time);
          }
        }

        // Check if we're within limits BEFORE adding new request
        const currentCount = requests.size;
        const limit = parseInt(process.env.HUME_RATE_LIMIT, 10) || 100;

        if (currentCount >= limit) {
          return Promise.reject(new Error('Rate limit exceeded'));
        }

        // Add the new request after checking limits
        // Use counter to ensure unique keys for rapid calls
        const uniqueKey = `${now}_${++counter}`;
        requests.set(uniqueKey, points);
        return Promise.resolve();
      },
    };
  }

  async initialize() {
    if (!this.apiKey) {
      this.posthog.capture({
        distinctId: 'system',
        event: 'hume_initialization_failed',
        properties: { error: 'Missing HUME_API_KEY' },
      });
      throw new Error('HUME_API_KEY is missing');
    }
    await this.testConnection();
    this.posthog.capture({
      distinctId: 'system',
      event: 'hume_initialized',
      properties: { success: true },
    });
    // Only upsert the API key if missing or different
    const { data, error } = await supabase
      .from('vault.secrets')
      .select('secret')
      .eq('name', 'hume_api_key')
      .single();
    if (error || !data || data.secret !== this.apiKey) {
      await supabase.from('vault.secrets').upsert({
        name: 'hume_api_key',
        secret: this.apiKey,
      });
    }
  }

  async testConnection() {
    // Make a lightweight API call to verify Hume API connectivity
    try {
      // List jobs as a lightweight check (does not create or modify data)
      await this.client.expressionMeasurement.batch.listJobs({ limit: 1 });
      return true;
    } catch (error) {
      // Optionally log the error
      this.posthog.capture({
        distinctId: 'system',
        event: 'hume_connection_failed',
        properties: { error: error.message },
      });
      // Return false or throw, depending on use case
      return false;
    }
  }

  async analyzeEmotion(text, comparisonId) {
    // Validate text input
    if (typeof text !== 'string' || text.length < 1 || text.length > 1000) {
      throw new Error(
        'Input text must be a string between 1 and 1000 characters.'
      );
    }
    await this.rateLimiter.consume(1);
    let normalizedScore;
    let source = 'hume';
    try {
      if (this.circuitBreaker.isOpen()) {
        throw new Error('Hume circuit breaker is OPEN');
      }
      // Real Hume API call for language emotion analysis
      const result = await this.client.language.analyzeText({ texts: [text] });
      const prediction = result?.predictions?.[0] || {};
      const rawScore = {
        arousal: prediction.arousal,
        valence: prediction.valence,
        confidence: prediction.confidence,
      };
      normalizedScore = this.scorer.normalizeScore(rawScore);
      if (!this.scorer.validateScore(normalizedScore)) {
        throw new Error('Emotional score below thresholds');
      }
      // Store result in Supabase (comparisons table)
      await supabase
        .from('comparisons')
        .update({
          emotional_score: normalizedScore,
          score_source: 'hume',
        })
        .eq('id', comparisonId);
    } catch (error) {
      this.posthog.capture({
        distinctId: 'system',
        event: 'hume_fallback_triggered',
        properties: { error: error.message },
      });
      normalizedScore = await this.fallback.analyzeEmotion(text);
      source = 'gpt4o';
      // Store fallback result in Supabase
      await supabase
        .from('comparisons')
        .update({
          emotional_score: normalizedScore,
          score_source: 'gpt4o',
        })
        .eq('id', comparisonId);
    }
    return { ...normalizedScore, source };
  }
}

export default HumeService;
export { humeClient };
