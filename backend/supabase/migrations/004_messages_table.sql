-- Task 13: Messages API Database Migration
-- PRD: trust_indicators table (primary focus)
CREATE TABLE trust_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance index for <200ms queries
CREATE INDEX idx_trust_indicators_created_at ON trust_indicators(created_at DESC);

-- Extended messages table for future functionality
CREATE TYPE message_type AS ENUM (
  'trust_indicator', 'testimonial', 'system_notification'
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT,
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  type message_type NOT NULL DEFAULT 'trust_indicator',
  trust_score_context NUMERIC,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for <200ms queries
CREATE INDEX idx_messages_type_status ON messages(type, status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- RLS policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of trust indicators" ON messages
  FOR SELECT USING (type = 'trust_indicator' AND status = 'active');

-- Insert sample trust indicators for testing
INSERT INTO trust_indicators (text) VALUES
  ('CanAI launched my bakery!'),
  ('99.9% uptime'),
  ('GDPR compliant'),
  ('10k+ users'),
  ('Trusted by 500+ businesses'),
  ('24/7 support'),
  ('Bank-level security'),
  ('30-day money-back guarantee');