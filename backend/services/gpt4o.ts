/* eslint-disable global-require */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import supabase from '../supabase/client.js';
import * as Sentry from '@sentry/node';
import { PostHog } from 'posthog-node';
import Joi from 'joi';
import { encoding_for_model } from '@dqbd/tiktoken';
import hume from './hume.js';
import log from './logger.js';
const logger = log as unknown as import('pino').Logger;

dotenv.config();

const paramSchema = Joi.object({
  temperature: Joi.number().min(0).max(1).default(0.7),
  max_tokens: Joi.number().min(1).max(4096).default(4096),
});

interface SupabaseClient {
  rpc: (
    name: string,
    params: Record<string, unknown>
  ) => Promise<{ data: unknown; error: unknown }>;
  from: (table: string) => {
    insert: (data: Record<string, unknown>) => Promise<{ error?: unknown }>;
    select: (columns: string) => {
      eq: (
        column: string,
        value: unknown
      ) => {
        gte: (column: string, value: string) => Promise<{ data: unknown[] }>;
      };
    };
  };
}

interface PostHogInstance {
  capture: (event: string, properties?: Record<string, unknown>) => void;
}

interface GenerateParams {
  temperature?: number;
  max_tokens?: number;
  prompt_type?: string;
}

interface ValidationOptions {
  promptType?: string;
  userId?: string | null;
  trustDelta?: number | null;
}

class GPT4Service {
  supabase: SupabaseClient;
  posthog: PostHogInstance;
  client: OpenAI | null;

  constructor(
    supabase: SupabaseClient,
    posthogInstance: PostHogInstance = new PostHog(
      process.env['POSTHOG_API_KEY']
    ) as unknown as PostHogInstance
  ) {
    this.supabase = supabase;
    this.posthog = posthogInstance;
    this.client = null;
  }

  async initialize() {
    try {
      logger.info('Initializing GPT-4o client');
      const { data, error } = await this.supabase.rpc('get_secret', {
        secret_name: 'openai_api_key',
      });
      logger.info('Vault get_secret', { data, error });
      if (error)
        throw new Error(
          `Vault error: ${error instanceof Error ? error.message : String(error)}`
        );
      let apiKey = '';
      if (typeof data === 'string') {
        apiKey = data.replace(/\s+/g, '');
      } else if (
        data &&
        typeof data === 'object' &&
        'openai_api_key' in data &&
        typeof data.openai_api_key === 'string'
      ) {
        apiKey = data.openai_api_key.replace(/\s+/g, '');
      }
      if (!apiKey) {
        apiKey = process.env['OPENAI_API_KEY']
          ? process.env['OPENAI_API_KEY'].replace(/\s+/g, '')
          : '';
      }
      if (!apiKey) throw new Error('OPENAI_API_KEY is required');
      this.client = new OpenAI({ apiKey });
      await this.client.models.list();
      logger.info('GPT-4o client initialized');
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }

  async generate(prompt: string, params: GenerateParams = {}) {
    let retries = 0;
    const maxRetries = 3;
    const baseDelay = 1000;
    while (retries <= maxRetries) {
      try {
        const response = await this.client!.chat.completions.create({
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
          error: err instanceof Error ? err.message : String(err),
        });
        if (retries > maxRetries) {
          Sentry.captureException(err);
          await this.supabase.from('error_logs').insert({
            error_type: 'gpt4o_error',
            message: err instanceof Error ? err.message : String(err),
            details: JSON.stringify({ prompt, params }),
          });
          throw new Error(
            `Max retries exceeded: ${err instanceof Error ? err.message : String(err)}`
          );
        }
        const delay =
          Math.pow(2, retries) * baseDelay + Math.floor(Math.random() * 100);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error(
      'Unexpected error: generate() exited loop without returning'
    );
  }

  async getParameters(promptType: string) {
    const defaults: Record<
      string,
      { temperature: number; max_tokens: number }
    > = {
      business_plan: { temperature: 0.7, max_tokens: 4096 },
      social_media: { temperature: 0.9, max_tokens: 1000 },
      website_audit: { temperature: 0.6, max_tokens: 2000 },
    };
    const params = defaults[promptType] || defaults.business_plan;
    const { error, value } = paramSchema.validate(params);
    if (error) throw new Error(`Invalid parameters: ${error.message}`);
    return value;
  }

  countTokens(text: string) {
    logger.debug('countTokens input', { text });
    const enc = encoding_for_model('gpt-4o');
    const tokens = enc.encode(text);
    logger.debug('countTokens tokens', { tokens });
    enc.free();
    return tokens.length;
  }

  async calculateCost({
    user_id,
    token_usage,
    prompt_version,
    prompt_type,
  }: {
    user_id: string;
    token_usage: number;
    prompt_version: string;
    prompt_type: string;
  }) {
    const costPerMillion = 5;
    const cost = (token_usage / 1_000_000) * costPerMillion;
    logger.info('calculateCost', { cost });
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

  chunkInput(input: unknown, maxTokens = 128000) {
    logger.debug('chunkInput input', { input });
    const enc = encoding_for_model('gpt-4o');
    let text = '';
    if (typeof input === 'object' && input !== null) {
      const inputObj = input as Record<string, unknown>;
      text = [
        inputObj.businessDescription,
        inputObj.revenueModel,
        ...Object.values(inputObj).filter(
          v => v !== inputObj.businessDescription && v !== inputObj.revenueModel
        ),
      ]
        .filter(Boolean)
        .join('\n');
    } else {
      text = String(input);
    }
    const tokens = enc.encode(text);
    logger.debug('chunkInput tokens', { tokens });
    const chunks = [];
    for (let i = 0; i < tokens.length; i += maxTokens) {
      const decoded = enc.decode(tokens.slice(i, i + maxTokens));
      const chunk =
        typeof decoded === 'string' ? decoded : String.fromCharCode(...decoded);
      logger.debug('chunkInput chunk', { chunk });
      chunks.push(chunk);
    }
    enc.free();
    return chunks;
  }

  async validateResponse(response: string, options: ValidationOptions = {}) {
    const promptType = options.promptType ?? 'business_plan';
    const userId = options.userId ?? null;
    const trustDelta = options.trustDelta ?? null;
    const issues: string[] = [];
    const resonance = {
      arousal: null as number | null,
      valence: null as number | null,
      score: null as number | null,
    };
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
      const result = await (
        hume as unknown as {
          language: {
            analyzeText: (params: { texts: string[] }) => Promise<unknown>;
          };
        }
      ).language.analyzeText({
        texts: [response],
      });
      logger.debug('Hume analyzeText result', { result });
      const pred =
        (
          result as {
            predictions?: Array<{ arousal?: number; valence?: number }>;
          }
        )?.predictions?.[0] || {};
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
        logger.debug('Fallback resonance result', { fallbackRaw });
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
      logger.debug('Toxicity result', { toxResult });
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
    logger.debug('WCAG issues', { issues, wcagPassed });

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
    logger.info('Validation result', { isValid, trustScore, issues });

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

const gpt4Service = new GPT4Service(supabase);

export async function gpt4oGenerate(prompt, params = {}) {
  if (!gpt4Service.client) {
    await gpt4Service.initialize();
  }
  const content = await gpt4Service.generate(prompt, params);
  // Return an object with content and raw, to match previewGenerator.js usage
  return { content, raw: content };
}

export { GPT4Service };
