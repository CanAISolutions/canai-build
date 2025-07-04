-- Migration: Add event_type and metadata columns to payment_logs, plus indexes
-- Task: 7.6 Payment Logging to Supabase
-- Date: 2025-07-01

-- Add event_type and metadata columns (nullable for backward compatibility)
ALTER TABLE payment_logs
  ADD COLUMN IF NOT EXISTS event_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add index on event_type for analytics and query performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);

-- Add index on status for status-based queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);