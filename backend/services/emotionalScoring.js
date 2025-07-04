// backend/services/emotionalScoring.js
import posthog from './posthog.js';

const EmotionalThresholds = {
  arousal: { min: 0.5, target: 0.7, max: 0.9 },
  valence: { min: 0.6, target: 0.8, max: 0.95 },
};

class EmotionalScorer {
  constructor() {
    // this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
  }

  validateScore(score) {
    const isValid =
      score.arousal >= EmotionalThresholds.arousal.min &&
      score.valence >= EmotionalThresholds.valence.min;
    posthog.capture('emotional_score_validated', {
      isValid,
      arousal: score.arousal,
      valence: score.valence,
    });
    return isValid;
  }

  normalizeScore(rawScore) {
    return {
      arousal: Math.min(Math.max(rawScore.arousal || 0, 0), 1),
      valence: Math.min(Math.max(rawScore.valence || 0, 0), 1),
      confidence: rawScore.confidence || 0.8,
    };
  }
}

export default EmotionalScorer;
