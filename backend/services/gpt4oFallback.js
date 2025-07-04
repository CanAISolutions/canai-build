// backend/services/gpt4oFallback.js
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import EmotionalScorer from './emotionalScoring.js';
import posthog from './posthog.js';
// Placeholder: import PostHog from 'posthog-js';

class GPT4oFallbackService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.scorer = new EmotionalScorer();
    // this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
  }

  async analyzeEmotion(text) {
    const prompt = this.buildEmotionalAnalysisPrompt(text);
    let rawScore;
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.2,
      });
      if (
        !response ||
        !response.choices ||
        !response.choices[0] ||
        !response.choices[0].message ||
        !response.choices[0].message.content
      ) {
        throw new Error('Invalid response from OpenAI API');
      }
      rawScore = this.parseResponse(response.choices[0].message.content);
    } catch (error) {
      // this.posthog.capture('gpt4o_api_error', { error: error.message });
      throw new Error(`GPT-4o API call failed: ${error.message}`);
    }
    const normalizedScore = this.scorer.normalizeScore(rawScore);
    if (!this.scorer.validateScore(normalizedScore)) {
      throw new Error('GPT-4o emotional score below thresholds');
    }
    posthog.capture('gpt4o_fallback_triggered', {
      reason: 'hume_unavailable',
      score: normalizedScore,
    });
    return normalizedScore;
  }

  buildEmotionalAnalysisPrompt(text) {
    return `
You are an advanced emotional intelligence model, specializing in nuanced emotional analysis of text, similar to Hume AI. Your task is to analyze the provided text and return a JSON object with the following fields:

- "arousal": number (0.0 to 1.0) — Intensity of emotion, where 0.0 is calm/neutral and 1.0 is highly activated/excited. Consider both positive and negative excitement.
- "valence": number (0.0 to 1.0) — Positivity of emotion, where 0.0 is very negative (distress, sadness, anger) and 1.0 is very positive (joy, satisfaction, hope).
- "confidence": number (0.0 to 1.0) — Your confidence in the accuracy of your analysis, based on clarity and emotional cues in the text.

Instructions:
- Consider subtle cues, context, and emotional undertones, not just explicit words.
- If the text is ambiguous or emotionally flat, arousal and valence should be closer to 0.5, and confidence should be lower.
- If the text is emotionally rich or clear, confidence should be higher.
- Do not include any explanation or extra text—return only the JSON object.

Examples:
1. Text: "I can't believe how amazing this opportunity is! I'm thrilled to be part of it."
   Response: {"arousal": 0.92, "valence": 0.95, "confidence": 0.95}
2. Text: "I'm not sure how I feel about this. It's okay, I guess, but nothing special."
   Response: {"arousal": 0.45, "valence": 0.55, "confidence": 0.65}
3. Text: "Despite the setbacks, I feel hopeful we'll succeed."
   Response: {"arousal": 0.7, "valence": 0.8, "confidence": 0.85}

Now analyze the following text:
"""
${text}
"""
Return only the JSON object as described above.`;
  }

  parseResponse(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      // this.posthog.capture('gpt4o_parse_error', { error: error.message });
      posthog.capture('gpt4o_parse_error', { error: error.message });
      throw new Error('Invalid GPT-4o response format');
    }
  }
}

export default GPT4oFallbackService;
