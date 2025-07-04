-- Logging Tables Migration - CanAI Platform
-- Creates: feedback_logs, share_logs, error_logs, session_logs
-- Dependencies: auth.users (Supabase built-in), prompt_logs (from 001_core_tables.sql)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FEEDBACK_LOGS TABLE
-- ============================================================================
-- Stores user feedback ratings and comments for deliverables
CREATE TABLE feedback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompt_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Feedback content
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  shared_platforms TEXT[], -- Array of platforms where content was shared
  
  -- Metadata
  feedback_type TEXT CHECK (feedback_type IN ('deliverable', 'spark', 'general')) DEFAULT 'deliverable',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for feedback analysis
CREATE INDEX idx_feedback_logs_prompt_id ON feedback_logs(prompt_id);
CREATE INDEX idx_feedback_logs_rating ON feedback_logs(rating);

-- Row Level Security
ALTER TABLE feedback_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY feedback_logs_rls ON feedback_logs 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

-- Composite index for feedback_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_feedback_logs_user_id_created_at ON feedback_logs(user_id, created_at DESC);

-- ============================================================================
-- SHARE_LOGS TABLE
-- ============================================================================
-- Tracks social media sharing activity
CREATE TABLE share_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES prompt_logs(id) ON DELETE CASCADE,
  
  -- Sharing details
  platform TEXT CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'email')) NOT NULL,
  share_type TEXT CHECK (share_type IN ('deliverable', 'spark', 'referral')) DEFAULT 'deliverable',
  recipient_email TEXT, -- For email shares or referrals
  
  -- Metadata
  shared_content_type TEXT, -- 'pdf', 'link', 'text', etc.
  success BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for sharing analysis
CREATE INDEX idx_share_logs_user_id ON share_logs(user_id);

-- Row Level Security
ALTER TABLE share_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY share_logs_rls ON share_logs 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

-- Composite index for share_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_share_logs_user_id_created_at ON share_logs(user_id, created_at DESC);

-- ============================================================================
-- ERROR_LOGS TABLE
-- ============================================================================
-- Comprehensive error tracking and support request management
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Error details
  error_message TEXT NOT NULL,
  error_type TEXT CHECK (error_type IN ('timeout', 'invalid_input', 'stripe_failure', 'low_confidence', 'contradiction', 'nsfw', 'token_limit', 'webhook_failure')) NOT NULL,
  stack_trace TEXT,
  
  -- Context
  action TEXT, -- What action was being performed
  endpoint TEXT, -- API endpoint if applicable
  user_agent TEXT,
  ip_address INET,
  
  -- Support and resolution
  support_request BOOLEAN DEFAULT false,
  retry_count INTEGER CHECK (retry_count BETWEEN 0 AND 3) DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  
  -- References
  feedback_id UUID REFERENCES feedback_logs(id) ON DELETE CASCADE,
  session_id UUID, -- Will reference session_logs after it's created
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Performance indexes for error analysis
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_support_request ON error_logs(support_request);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_feedback_id ON error_logs(feedback_id);
CREATE INDEX idx_error_logs_endpoint ON error_logs(endpoint);

-- Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY error_logs_rls ON error_logs 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

-- Composite index for error_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id_created_at ON error_logs(user_id, created_at DESC);

-- Composite index for error_logs: (error_type, created_at)
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type_created_at ON error_logs(error_type, created_at DESC);

-- ============================================================================
-- SESSION_LOGS TABLE
-- ============================================================================
-- Track user sessions, interactions, and referral activity
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Session details
  session_start TIMESTAMPTZ DEFAULT now(),
  session_end TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  
  -- Activity tracking
  actions_count INTEGER DEFAULT 0,
  page_views_count INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  
  -- Interaction details
  interaction_type TEXT CHECK (interaction_type IN ('page_view', 'button_click', 'form_submit', 'api_call')),
  interaction_details JSONB DEFAULT '{}',
  
  -- Referral tracking
  referral_email TEXT,
  referral_link TEXT,
  referral_code TEXT,
  
  -- Technical details
  user_agent TEXT,
  ip_address INET,
  device_type TEXT,
  browser TEXT,
  
  -- Performance metrics
  page_load_time_ms INTEGER,
  api_response_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for session analysis
CREATE INDEX idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX idx_session_logs_interaction_type ON session_logs(interaction_type);
CREATE INDEX idx_session_logs_referral_email ON session_logs(referral_email);
CREATE INDEX idx_session_logs_session_start ON session_logs(session_start);
CREATE INDEX idx_session_logs_device_type ON session_logs(device_type);

-- Row Level Security
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY session_logs_rls ON session_logs 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

-- Composite index for session_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id_created_at ON session_logs(user_id, created_at DESC);

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Add the foreign key constraint from error_logs to session_logs now that both tables exist
ALTER TABLE error_logs ADD CONSTRAINT fk_error_logs_session_id
  FOREIGN KEY (session_id) REFERENCES session_logs(id) ON DELETE SET NULL;

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
-- Add triggers for updated_at automation
CREATE TRIGGER update_feedback_logs_updated_at BEFORE UPDATE ON feedback_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_logs_updated_at BEFORE UPDATE ON session_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PARTITIONING FOR HIGH-VOLUME TABLES
-- ============================================================================
-- Partition error_logs by month for better performance with large datasets
-- This is optional and can be enabled later if needed
-- CREATE TABLE error_logs_y2024m01 PARTITION OF error_logs
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================================================
-- DATA RETENTION POLICIES
-- ============================================================================
-- Create function for data retention (24 months per PRD)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Clean up old feedback logs (24 months)
  DELETE FROM feedback_logs 
  WHERE created_at < NOW() - INTERVAL '24 months';
  
  -- Clean up old share logs (24 months)
  DELETE FROM share_logs 
  WHERE created_at < NOW() - INTERVAL '24 months';
  
  -- Clean up old error logs (24 months, but keep support requests longer)
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '24 months'
    AND support_request = false;
  
  -- Clean up old session logs (24 months)
  DELETE FROM session_logs 
  WHERE created_at < NOW() - INTERVAL '24 months';
  
  RAISE NOTICE 'Cleaned up logs older than 24 months';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE feedback_logs IS 'Stores user feedback ratings and comments for deliverables with sentiment analysis';
COMMENT ON TABLE share_logs IS 'Tracks social media sharing activity and referral links';
COMMENT ON TABLE error_logs IS 'Comprehensive error tracking and support request management';
COMMENT ON TABLE session_logs IS 'User session tracking, interactions, and performance metrics';

COMMENT ON COLUMN feedback_logs.rating IS 'User rating from 1-5 for deliverable quality';
COMMENT ON COLUMN feedback_logs.sentiment IS 'AI-analyzed sentiment: positive, neutral, or negative';
COMMENT ON COLUMN error_logs.error_type IS 'Categorized error types for analysis and alerting';
COMMENT ON COLUMN error_logs.support_request IS 'Flag indicating if this error requires support intervention';
COMMENT ON COLUMN session_logs.interaction_details IS 'JSONB field for flexible interaction data storage';
COMMENT ON COLUMN session_logs.referral_code IS 'Unique referral code for tracking referral campaigns';

-- ============================================================================
-- PERFORMANCE VALIDATION
-- ============================================================================
-- Verify indexes are created properly
-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('feedback_logs', 'share_logs', 'error_logs', 'session_logs')
-- ORDER BY tablename, indexname; 

