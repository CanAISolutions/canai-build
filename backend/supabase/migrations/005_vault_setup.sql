-- backend/supabase/migrations/202506241324_vault_setup.sql
CREATE TABLE vault.secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add encrypted column to payment_logs
ALTER TABLE payment_logs
ADD COLUMN encrypted_stripe_payment_id TEXT;

-- Create index for performance
CREATE INDEX idx_payment_logs_encrypted ON payment_logs (encrypted_stripe_payment_id);

-- Enable RLS on vault.secrets
ALTER TABLE vault.secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_secrets_rls ON vault.secrets
  FOR ALL TO authenticated
  USING (false); -- Restrict access to vault.secrets