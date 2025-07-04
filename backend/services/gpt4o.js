/* eslint-disable global-require */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import supabase from '../supabase/client.js';
import * as Sentry from '@sentry/node';
import { PostHog } from 'posthog-node';
import Joi from 'joi';
import { encoding_for_model } from '@dqbd/tiktoken';
import hume from './hume.js';
import log from '../api/src/Shared/Logger';

dotenv.config();

const paramSchema = Joi.object({
  temperature: Joi.number().min(0).max(1).default(0.7),
  max_tokens: Joi.number().min(1).max(4096).default(4096),
});

class GPT4Service {
  constructor(
    supabase,
    posthogInstance = new PostHog(process.env.POSTHOG_API_KEY)
  ) {
    this.supabase = supabase;
    this.posthog = posthogInstance;
    this.client = null;
  }

  async initialize() {
    try {
      log.info('Initializing GPT-4o client');
      const { data, error } = await this.supabase.rpc('get_secret', {
        secret_name: 'openai_api_key',
      });
      log.info('Vault get_secret', { data, error });
      if (error) throw new Error(`Vault error: ${error.message}`);
      let apiKey = '';
      if (typeof data === 'string') {
        apiKey = data.replace(/\s+/g, '');
      } else if (data && typeof data.openai_api_key === 'string') {
        apiKey = data.openai_api_key.replace(/\s+/g, '');
      }
      if (!apiKey) {
        apiKey = process.env.OPENAI_API_KEY
          ? process.env.OPENAI_API_KEY.replace(/\s+/g, '')
          : '';
      }
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.client = new OpenAI({ apiKey });
      await this.client.models.list();
      log.info('GPT-4o client initialized');
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }

  async generate(prompt, params = {}) {
    let retries = 0;
    const maxRetries = 3;
    const baseDelay = 1000;
    while (retries <= maxRetries) {
      try {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          ...params,
        });
        this.posthog.capture('gpt4o_request', {
          prompt_type: params.prompt_type || 'unknown',
          token_usage: response.usage ? response.usage.total_tokens : undefined,
        });
        return response.choices[0].message.content;
      } catch (err) {
        retries++;
        this.posthog.capture('gpt4o_retry', {
          retry_count: retries,
          error: err.message,
        });
        if (retries > maxRetries) {
          Sentry.captureException(err);
          await this.supabase.from('error_logs').insert({
            error_type: 'gpt4o_error',
            message: err.message,
            details: JSON.stringify({ prompt, params }),
          });
          throw new Error(`Max retries exceeded: ${err.message}`);
        }
        const delay =
          Math.pow(2, retries) * baseDelay + Math.floor(Math.random() * 100);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getParameters(promptType) {
    const defaults = {
      business_plan: { temperature: 0.7, max_tokens: 4096 },
      social_media: { temperature: 0.9, max_tokens: 1000 },
      website_audit: { temperature: 0.6, max_tokens: 2000 },
    };
    const params = defaults[promptType] || defaults.business_plan;
    const { error, value } = paramSchema.validate(params);
    if (error) throw new Error(`Invalid parameters: ${error.message}`);
    return value;
  }

  countTokens(text) {
    log.debug('countTokens input', { text });
    const enc = encoding_for_model('gpt-4o');
    const tokens = enc.encode(text);
    log.debug('countTokens tokens', { tokens });
    enc.free();
    return tokens.length;
  }

  async calculateCost({ user_id, token_usage, prompt_version, prompt_type }) {
    const costPerMillion = 5;
    const cost = (token_usage / 1_000_000) * costPerMillion;
    log.info('calculateCost', { cost });
    await this.supabase.from('prompt_logs').insert({
      user_id,
      token_usage,
      cost,
      prompt_version,
    });
    this.posthog.capture('gpt4o_request', { token_usage, prompt_type });
    if (cost > 50) {
      await this.supabase.from('support_requests').insert({
        user_id,
        message: `Daily GPT-4o cost exceeded: $${cost.toFixed(2)}`,
      });
      this.posthog.capture('cost_threshold_exceeded', { cost });
    }
    return cost;
  }

  chunkInput(input, maxTokens = 128000) {
    log.debug('chunkInput input', { input });
    const enc = encoding_for_model('gpt-4o');
    let text = '';
    if (typeof input === 'object' && input !== null) {
      text = [
        input.businessDescription,
        input.revenueModel,
        ...Object.values(input).filter(
          v => v !== input.businessDescription && v !== input.revenueModel
        ),
      ]
        .filter(Boolean)
        .join('\n');
    } else {
      text = String(input);
    }
    const tokens = enc.encode(text);
    log.debug('chunkInput tokens', { tokens });
    const chunks = [];
    for (let i = 0; i < tokens.length; i += maxTokens) {
      const decoded = enc.decode(tokens.slice(i, i + maxTokens));
      const chunk =
        typeof decoded === 'string' ? decoded : String.fromCharCode(...decoded);
      log.debug('chunkInput chunk', { chunk });
      chunks.push(chunk);
    }
    enc.free();
    return chunks;
  }

  async validateResponse(response, options = {}) {
    const {
      promptType = 'business_plan',
      userId = null,
      trustDelta = null,
    } = options;
    const issues = [];
    const resonance = { arousal: null, valence: null, score: null };
    let trustScore = 0;
    let isValid = false;
    let toxicity = false;
    let wcagPassed = true;

    try {
      const { data: humeLogs } = await this.supabase
        .from('error_logs')
        .select('id')
        .eq('error_type', 'hume_circuit')
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );
      const humeReqsToday = humeLogs ? humeLogs.length : 0;
      if (humeReqsToday > 900) throw new Error('Hume circuit breaker');
      const result = await hume.language.analyzeText({ texts: [response] });
      log.debug('Hume analyzeText result', { result });
      const pred = result?.predictions?.[0] || {};
      resonance.arousal = pred.arousal ?? null;
      resonance.valence = pred.valence ?? null;
      resonance.score =
        resonance.arousal !== null && resonance.valence !== null
          ? (Number(resonance.arousal) + Number(resonance.valence)) / 2
          : null;
    } catch (err) {
      try {
        const fallbackPrompt = `Estimate emotional resonance (arousal 0-1, valence 0-1) as JSON: { "arousal": <float>, "valence": <float> }\nText: ${response}`;
        const fallbackRaw = await this.generate(fallbackPrompt, {
          max_tokens: 60,
        });
        log.debug('Fallback resonance result', { fallbackRaw });
        const fallbackParsed = JSON.parse(
          fallbackRaw.match(/\{.*\}/s)?.[0] || '{}'
        );
        resonance.arousal = fallbackParsed.arousal ?? null;
        resonance.valence = fallbackParsed.valence ?? null;
        resonance.score =
          resonance.arousal !== null && resonance.valence !== null
            ? (Number(resonance.arousal) + Number(resonance.valence)) / 2
            : null;
      } catch (fallbackErr) {
        issues.push('Hume AI and fallback failed');
        Sentry.captureException(fallbackErr);
      }
    }

    try {
      const toxPrompt = `Is this text toxic? Respond "yes" or "no".\nText: ${response}`;
      const toxResult = await this.generate(toxPrompt, { max_tokens: 5 });
      log.debug('Toxicity result', { toxResult });
      if (/yes/i.test(toxResult)) {
        toxicity = true;
        issues.push('Toxic content detected');
        await this.supabase.from('error_logs').insert({
          error_type: 'toxic_content',
          message: 'Toxic content detected',
          details: JSON.stringify({ response }),
        });
        this.posthog.capture('toxicity_detected', { userId, promptType });
      }
    } catch (toxErr) {
      issues.push('Toxicity check failed');
      Sentry.captureException(toxErr);
    }

    if (/<img[^>]+>/i.test(response) && !/<img[^>]+alt=/i.test(response)) {
      wcagPassed = false;
      issues.push('Missing alt text for image');
    }
    if (/<a[^>]+>click here<\/a>/i.test(response)) {
      wcagPassed = false;
      issues.push('Non-descriptive link text ("click here")');
    }
    if (
      /<[a-z][\s\S]*>/i.test(response) &&
      !/<(main|nav|header|footer|section|article|aside|h[1-6]|p|ul|ol|li|button|label|form)/i.test(
        response
      )
    ) {
      wcagPassed = false;
      issues.push('Missing semantic HTML structure');
    }
    log.debug('WCAG issues', { issues, wcagPassed });

    const resonanceScore = resonance.score || 0;
    const trustDeltaScore = trustDelta
      ? Math.min(Math.max(trustDelta, 0), 5)
      : 0;
    const completeness = response.length > 100 ? 1 : 0;
    if (resonanceScore < 0.7)
      issues.push('Emotional resonance below threshold');
    if (trustDeltaScore < 4.2) issues.push('TrustDelta below threshold');
    trustScore = Math.round(
      resonanceScore >= 0.7 && trustDeltaScore >= 4.2
        ? (resonanceScore * 0.5 +
            (trustDeltaScore / 5) * 0.3 +
            completeness * 0.2) *
            100
        : (resonanceScore * 0.3 +
            (trustDeltaScore / 5) * 0.2 +
            completeness * 0.1) *
            100
    );
    isValid =
      resonanceScore > 0.7 &&
      trustDeltaScore >= 4.2 &&
      trustScore >= 50 &&
      !toxicity &&
      wcagPassed &&
      issues.length === 0;
    log.info('Validation result', { isValid, trustScore, issues });

    try {
      await this.supabase.from('comparisons').insert({
        user_id: userId,
        response,
        trust_score: trustScore,
        resonance,
        is_valid: isValid,
        issues,
        prompt_type: promptType,
      });
      this.posthog.capture('gpt4o_quality', {
        trust_score: trustScore,
        resonance,
        isValid,
        issues,
      });
    } catch (logErr) {
      Sentry.captureException(logErr);
    }

    return { response, trustScore, resonance, isValid, issues };
  }
}

export { GPT4Service };
