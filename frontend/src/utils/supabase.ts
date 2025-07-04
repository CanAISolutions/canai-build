/**
 * Supabase client configuration for CanAI Platform
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration using Vite environment variables
const SUPABASE_URL =
  import.meta.env['VITE_SUPABASE_URL'] || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY'];
if (!SUPABASE_ANON_KEY) throw new Error('VITE_SUPABASE_ANON_KEY is required');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database schemas as defined in PRD
export interface SessionLog {
  id: string;
  user_id?: string | null;
  stripe_payment_id?: string;
  interaction_type: string;
  interaction_details: Record<
    string,
    string | number | boolean | null | undefined
  >;
  created_at: string;
}

export interface InitialPromptLog {
  id: string;
  user_id?: string;
  payload: Record<string, string | number | boolean | null | undefined>;
  trust_score?: number;
  other_type?: string;
  custom_tone?: string;
  created_at: string;
}

export interface SparkLog {
  id: string;
  initial_prompt_id: string;
  selected_spark: {
    title?: string;
    tagline?: string;
    content?: string;
    emotional_tone?: string;
    trust_indicators?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
  };
  product_track: 'business_builder' | 'social_email' | 'site_audit';
  feedback?: string;
  created_at: string;
}

// Enhanced error log interface with support_request column
export interface ErrorLog {
  id?: string;
  created_at?: string;
  user_id?: string;
  error_message: string;
  action: string;
  error_type:
    | 'timeout'
    | 'invalid_input'
    | 'stripe_failure'
    | 'low_confidence'
    | 'contradiction'
    | 'nsfw'
    | 'token_limit';
  support_request?: boolean;
}

// RLS Policies (to be applied in Supabase dashboard)
/*
-- Enable RLS on session_logs
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own session logs
CREATE POLICY "User access session_logs" ON session_logs
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can insert session logs
CREATE POLICY "Anonymous insert session_logs" ON session_logs
  FOR INSERT WITH CHECK (true);

-- Enable RLS on initial_prompt_logs
ALTER TABLE initial_prompt_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own prompt logs
CREATE POLICY "User access initial_prompt_logs" ON initial_prompt_logs
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can insert prompt logs
CREATE POLICY "Anonymous insert initial_prompt_logs" ON initial_prompt_logs
  FOR INSERT WITH CHECK (true);

-- Enable RLS on error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own error logs
CREATE POLICY "User access error_logs" ON error_logs
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can insert error logs
CREATE POLICY "Anonymous insert error_logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Initial prompt logs schema
CREATE TABLE initial_prompt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  payload JSONB NOT NULL,
  trust_score NUMERIC CHECK (trust_score BETWEEN 0 AND 100),
  other_type TEXT,
  custom_tone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
*/

// Supabase Vault encryption configuration
export const enableVaultEncryption = async () => {
  try {
    // TODO: Configure Supabase Vault encryption
    /*
    -- Enable vault extension
    CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

    -- Create encryption key for prompt_logs
    INSERT INTO vault.secrets (name, secret)
    VALUES ('prompt_logs_encryption_key', 'your-encryption-key-here')
    ON CONFLICT (name) DO NOTHING;

    -- Enable vault encryption for sensitive fields
    ALTER TABLE prompt_logs
    ADD COLUMN IF NOT EXISTS encrypted_payload vault.encrypted_jsonb;

    -- Create function to encrypt payload
    CREATE OR REPLACE FUNCTION encrypt_prompt_payload(payload jsonb)
    RETURNS vault.encrypted_jsonb
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN vault.encrypt_jsonb(payload, (SELECT secret FROM vault.secrets WHERE name = 'prompt_logs_encryption_key'));
    END;
    $$;
    */

    console.log(
      '[Supabase] Vault encryption configuration ready (requires manual setup)'
    );
    return true;
  } catch (error) {
    console.error('[Supabase] Vault encryption setup failed:', error);
    return false;
  }
};

// Enhanced helper functions with encryption support
export const insertPromptLog = async (log: {
  user_id?: string;
  initial_prompt_id?: string;
  payload: Record<string, string | number | boolean | null | undefined>;
  location?: string;
  unique_value?: string;
}) => {
  try {
    // TODO: Use vault encryption for payload when configured
    const { data, error } = await supabase
      .from('prompt_logs')
      .insert([
        {
          user_id: log.user_id,
          initial_prompt_id: log.initial_prompt_id,
          payload: log.payload, // Will be encrypted_payload when vault is configured
          location: log.location,
          unique_value: log.unique_value,
        },
      ])
      .select();

    if (error) {
      console.error('[Supabase] Error inserting prompt log:', error);
      throw error;
    }

    console.log('[Supabase] Prompt log inserted successfully');
    return data;
  } catch (error) {
    console.error('[Supabase] insertPromptLog failed:', error);
    throw error;
  }
};

export const insertSessionLog = async (
  log: Omit<SessionLog, 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('session_logs')
    .insert([log])
    .select();

  if (error) {
    console.error('[Supabase] Error inserting session log:', error);
    throw error;
  }

  return data;
};

export const insertInitialPromptLog = async (
  log: Omit<InitialPromptLog, 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('initial_prompt_logs')
    .insert([log])
    .select();

  if (error) {
    console.error('[Supabase] Error inserting initial prompt log:', error);
    throw error;
  }

  return data;
};

export const insertSparkLog = async (
  log: Omit<SparkLog, 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('spark_logs')
    .insert([log])
    .select();

  if (error) {
    console.error('[Supabase] Error inserting spark log:', error);
    throw error;
  }

  return data;
};

// Enhanced helper functions for intent mirror
export const insertIntentMirrorLog = async (log: {
  user_id?: string;
  business_data: Record<string, string | number | boolean | null | undefined>;
  summary: string;
  confidence_score: number;
  clarifying_questions?: string[];
  response_time?: number;
}) => {
  try {
    // Insert into prompt_logs with intent mirror specific data
    const { data, error } = await supabase
      .from('prompt_logs')
      .insert([
        {
          user_id: log.user_id,
          payload: {
            business_data: log.business_data,
            summary: log.summary,
            confidence_score: log.confidence_score,
            clarifying_questions: log.clarifying_questions || [],
            response_time: log.response_time,
            step: 'intent_mirror',
            timestamp: new Date().toISOString(),
          },
          location: window.location.href,
          unique_value: `intent-mirror-${Date.now()}`,
        },
      ])
      .select();

    if (error) {
      console.error('[Supabase] Error inserting intent mirror log:', error);
      throw error;
    }

    console.log('[Supabase] Intent mirror log inserted successfully');
    return data;
  } catch (error) {
    console.error('[Supabase] insertIntentMirrorLog failed:', error);
    throw error;
  }
};

// Enhanced error logging with support_request
export const insertErrorLog = async (
  log: Omit<ErrorLog, 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('error_logs')
    .insert({
      ...log,
      support_request: log.support_request ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting error log:', error);
    return null;
  }

  return data;
};

// Enhanced comparisons logging function for SparkSplit
export const insertComparisonLog = async (log: {
  prompt_id: string;
  canai_output: string;
  generic_output?: string;
  emotional_resonance?: {
    score: number;
    factors: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    emotional_triggers?: string[];
  };
  trust_delta?: number;
  user_feedback?: string;
}) => {
  try {
    // Use vault encryption for sensitive outputs when configured
    const { data, error } = await supabase
      .from('comparisons')
      .insert([
        {
          prompt_id: log.prompt_id,
          canai_output: log.canai_output, // Will be encrypted when vault is configured
          generic_output: log.generic_output || '',
          trust_delta: log.trust_delta,
          emotional_resonance: log.emotional_resonance,
          user_feedback: log.user_feedback,
        },
      ])
      .select();

    if (error) {
      console.error('[Supabase] Error inserting comparison log:', error);
      throw error;
    }

    console.log('[Supabase] Comparison log inserted successfully');
    return data;
  } catch (error) {
    console.error('[Supabase] insertComparisonLog failed:', error);

    // F8-E1: Fallback to localStorage for critical comparison data
    try {
      const fallbackData = {
        ...log,
        timestamp: new Date().toISOString(),
        fallback_reason: 'supabase_error',
      };

      const existingData = JSON.parse(
        localStorage.getItem('canai_comparison_fallback') || '[]'
      );
      existingData.push(fallbackData);
      localStorage.setItem(
        'canai_comparison_fallback',
        JSON.stringify(existingData)
      );

      console.log('[F8-E1] Comparison data saved to localStorage fallback');
    } catch (storageError) {
      console.error('[F8-E1] localStorage fallback failed:', storageError);
    }

    throw error;
  }
};

// Update comparison log with user feedback
export const updateComparisonFeedback = async (
  prompt_id: string,
  user_feedback: string
) => {
  try {
    const { data, error } = await supabase
      .from('comparisons')
      .update({ user_feedback })
      .eq('prompt_id', prompt_id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating comparison feedback:', error);
      throw error;
    }

    console.log('[Supabase] Comparison feedback updated successfully');
    return data;
  } catch (error) {
    console.error('[Supabase] updateComparisonFeedback failed:', error);
    throw error;
  }
};

// Initialize RLS and create missing columns if needed
export const initializeIntentMirrorSupport = async () => {
  try {
    // TODO: Execute in Supabase SQL editor:
    /*
    -- Add support_request column to error_logs if it doesn't exist
    ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS support_request BOOLEAN DEFAULT false;

    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_error_logs_support_request ON error_logs(support_request);
    CREATE INDEX IF NOT EXISTS idx_prompt_logs_step ON prompt_logs((payload->>'step'));

    -- Update RLS policies for intent mirror
    CREATE POLICY IF NOT EXISTS "Intent mirror access" ON prompt_logs
      FOR SELECT USING (
        auth.uid() = user_id OR
        (payload->>'step' = 'intent_mirror' AND user_id IS NULL)
      );
    */

    console.log(
      '[Supabase] Intent mirror support initialization ready (requires manual SQL execution)'
    );
    return true;
  } catch (error) {
    console.error('[Supabase] Intent mirror initialization failed:', error);
    return false;
  }
};

// Initialize vault encryption on module load
enableVaultEncryption();

// Run initialization
initializeIntentMirrorSupport();
