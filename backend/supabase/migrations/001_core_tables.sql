-- Core Tables Migration - CanAI Emotional Sovereignty Platform
-- Creates: prompt_logs, comparisons, spark_logs
-- Dependencies: auth.users (Supabase built-in)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROMPT_LOGS TABLE
-- ============================================================================
-- Stores detailed input collection data (12 fields per PRD)
CREATE TABLE prompt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spark_log_id UUID, -- Will add FK constraint after spark_logs table
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 12-field detailed inputs per PRD Section 8.4
  business_description TEXT CHECK (char_length(business_description) BETWEEN 10 AND 1000),
  target_market TEXT,
  revenue_model TEXT,
  competitors TEXT,
  unique_value_proposition TEXT,
  location TEXT,
  funding_goal NUMERIC(12,2),
  timeline TEXT,
  team_experience TEXT,
  market_research TEXT,
  risk_mitigation TEXT,
  growth_strategy TEXT,

  -- Metadata and tracking
  completion_percentage NUMERIC(5,2) CHECK (completion_percentage BETWEEN 0 AND 100) DEFAULT 0,
  auto_save_count INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  validation_status TEXT CHECK (validation_status IN ('draft', 'validated', 'ready_for_generation')) DEFAULT 'draft',
  emotional_drivers JSONB DEFAULT '[]',
  context_analysis JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for <50ms queries
CREATE INDEX idx_prompt_logs_user_id ON prompt_logs(user_id, updated_at DESC);
CREATE INDEX idx_prompt_logs_completion ON prompt_logs(completion_percentage DESC, updated_at DESC);
CREATE INDEX idx_prompt_logs_validation_status ON prompt_logs(validation_status, updated_at DESC);
CREATE INDEX idx_prompt_logs_spark_log_id ON prompt_logs(spark_log_id);

-- Composite index for prompt_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_prompt_logs_user_id_created_at ON prompt_logs(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY prompt_logs_rls ON prompt_logs FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- SPARK_LOGS TABLE
-- ============================================================================
-- Stores initial spark generation and selection tracking
CREATE TABLE spark_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_prompt_id UUID, -- References initial_prompt_logs (to be created later)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Spark generation data
  generated_sparks JSONB NOT NULL DEFAULT '[]', -- Array of 3 spark objects
  selected_spark JSONB, -- Chosen spark details
  product_track TEXT CHECK (product_track IN ('business_builder', 'social_email', 'site_audit')),
  generation_metadata JSONB DEFAULT '{}', -- Attempt number, model version, etc.
  feedback TEXT,
  attempt_count INTEGER CHECK (attempt_count BETWEEN 1 AND 4) DEFAULT 1,
  selection_time_ms INTEGER, -- Time taken to select

  -- Quality metrics
  trust_score NUMERIC(5,2) CHECK (trust_score BETWEEN 0 AND 100),
  emotional_resonance JSONB DEFAULT '{}', -- Hume AI analysis results

  -- Status and lifecycle
  status TEXT CHECK (status IN ('generated', 'selected', 'expired')) DEFAULT 'generated',
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_spark_logs_user_id ON spark_logs(user_id, created_at DESC);
CREATE INDEX idx_spark_logs_product_track ON spark_logs(product_track, status, created_at DESC);
CREATE INDEX idx_spark_logs_status ON spark_logs(status, expires_at);
CREATE INDEX idx_spark_logs_attempt_count ON spark_logs(attempt_count, created_at DESC);
CREATE INDEX idx_spark_logs_initial_prompt_id ON spark_logs(initial_prompt_id, created_at DESC);

-- Composite index for spark_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_spark_logs_user_id_created_at ON spark_logs(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE spark_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY spark_logs_rls ON spark_logs FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- COMPARISONS TABLE
-- ============================================================================
-- Stores SparkSplit comparison functionality and TrustDelta scoring
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_log_id UUID REFERENCES prompt_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Comparison outputs
  canai_output TEXT NOT NULL,
  generic_output TEXT NOT NULL,
  deliverable_metadata JSONB DEFAULT '{}', -- Word count, readability, etc.

  -- Quality and resonance metrics
  trust_delta NUMERIC(3,2) CHECK (trust_delta BETWEEN 0 AND 5),
  emotional_resonance JSONB DEFAULT '{}', -- Hume AI analysis
  preference_indicators JSONB DEFAULT '{}',

  -- Generation metadata
  generation_time_ms INTEGER,
  model_versions JSONB DEFAULT '{}',
  file_exports JSONB DEFAULT '{}', -- PDF, DOCX URLs

  -- User preferences and tracking
  user_preference TEXT CHECK (user_preference IN ('canai', 'generic', 'undecided')),
  preference_recorded_at TIMESTAMPTZ,
  revision_count INTEGER DEFAULT 0 CHECK (revision_count >= 0),
  status TEXT CHECK (status IN ('generated', 'delivered', 'revised', 'finalized')) DEFAULT 'generated',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for comparison analysis
CREATE INDEX idx_comparisons_prompt_log_id ON comparisons(prompt_log_id);
CREATE INDEX idx_comparisons_user_id ON comparisons(user_id, created_at DESC);
CREATE INDEX idx_comparisons_trust_delta ON comparisons(trust_delta DESC, created_at DESC);
CREATE INDEX idx_comparisons_user_preference ON comparisons(user_preference, created_at DESC);
CREATE INDEX idx_comparisons_status ON comparisons(status, updated_at DESC);

-- Composite index for comparisons: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_comparisons_user_id_created_at ON comparisons(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY comparisons_rls ON comparisons FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Add the foreign key constraint from prompt_logs to spark_logs now that both tables exist
ALTER TABLE prompt_logs ADD CONSTRAINT fk_prompt_logs_spark_log_id
  FOREIGN KEY (spark_log_id) REFERENCES spark_logs(id) ON DELETE CASCADE;

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at automation
CREATE TRIGGER update_prompt_logs_updated_at BEFORE UPDATE ON prompt_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spark_logs_updated_at BEFORE UPDATE ON spark_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE prompt_logs IS 'Stores detailed input collection data with 12 fields per PRD requirements';
COMMENT ON TABLE spark_logs IS 'Tracks initial spark generation, selection, and attempt management';
COMMENT ON TABLE comparisons IS 'Manages SparkSplit comparison functionality with TrustDelta scoring';

COMMENT ON COLUMN prompt_logs.completion_percentage IS 'Tracks user progress through input collection (0-100)';
COMMENT ON COLUMN spark_logs.trust_score IS 'Quality metric for generated sparks (0-100)';
COMMENT ON COLUMN comparisons.trust_delta IS 'TrustDelta scoring for comparison quality (0-5, target ≥4.2)';
COMMENT ON COLUMN comparisons.emotional_resonance IS 'Hume AI emotional analysis results (target >0.7)';