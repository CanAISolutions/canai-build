-- Migration: Enable RLS and add policies for payment_logs
-- Task: 7.6 Payment Logging RLS Fix
-- Date: 2025-07-01

-- Enable Row Level Security
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- User policy: allow users to select their own logs
CREATE POLICY user_access_policy_select ON payment_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Admin policy: allow admin (role in JWT) to access all logs
CREATE POLICY admin_access_policy ON payment_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- (Optional) Insert/Update/Delete policies can be added as needed for your app