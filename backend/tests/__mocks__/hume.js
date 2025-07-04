import { vi } from 'vitest';

class MockRateLimiter {
  constructor() {
    this.calls = 0;
  }
  async consume() {
    this.calls++;
    if (this.calls > 100) throw new Error('RateLimiter exceeded');
    return true;
  }
}
class MockScorer {
  constructor() {
    this.belowThreshold = false;
  }
  normalizeScore(score) {
    return this.belowThreshold
      ? { arousal: 0.4, valence: 0.5, confidence: 0.9 }
      : score;
  }
  validateScore(score) {
    return !this.belowThreshold;
  }
}
class MockCircuitBreaker {
  constructor() {
    this.open = false;
  }
  isOpen() {
    return this.open;
  }
  onFailure() {}
  onSuccess() {}
  shouldAttemptReset() {
    return false;
  }
  state = 'CLOSED';
  FAILURE_THRESHOLD = 5;
  RESET_TIMEOUT = 1000;
}
class MockFallback {
  analyzeEmotion = vi.fn().mockResolvedValue({
    arousal: 0.7,
    valence: 0.8,
    confidence: 0.9,
    source: 'gpt4o',
  });
}
class MockHumeService {
  constructor({ circuitBreaker, fallback, scorer } = {}) {
    this.rateLimiter = new MockRateLimiter();
    this.scorer = scorer || new MockScorer();
    this.circuitBreaker = circuitBreaker || new MockCircuitBreaker();
    this.fallback = fallback || new MockFallback();
  }
  async initialize() {
    if (!process.env.HUME_API_KEY) throw new Error('HUME_API_KEY is missing');
  }
  async analyzeEmotion() {
    if (this.circuitBreaker.isOpen()) {
      return await this.fallback.analyzeEmotion();
    }
    const score = this.scorer.normalizeScore({
      arousal: 0.7,
      valence: 0.8,
      confidence: 0.9,
    });
    if (!this.scorer.validateScore(score)) {
      return await this.fallback.analyzeEmotion();
    }
    if (score.arousal < 0.5) {
      throw new Error('Score below threshold');
    }
    return { ...score, source: 'hume' };
  }
}
const analyzeText = async () => ({ arousal: 0.7, valence: 0.8 });
export default MockHumeService;
export { analyzeText };
