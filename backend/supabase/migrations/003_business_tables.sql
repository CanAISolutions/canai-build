-- Create payment_logs table with immutable financial records
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pricing table
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR(100) NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit log function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', NULL, to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), NULL, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create triggers for audit logging (use DO blocks to check existence)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'payment_logs_audit_trigger') THEN
    CREATE TRIGGER payment_logs_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON payment_logs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'support_requests_audit_trigger') THEN
    CREATE TRIGGER support_requests_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON support_requests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'pricing_audit_trigger') THEN
    CREATE TRIGGER pricing_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON pricing
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
END $$;

-- Create function to prevent updates to financial records
CREATE OR REPLACE FUNCTION prevent_payment_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.amount IS DISTINCT FROM NEW.amount OR OLD.currency IS DISTINCT FROM NEW.currency THEN
    RAISE EXCEPTION 'Financial records (amount, currency) cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to enforce immutable financial records (use DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_payment_updates_trigger') THEN
    CREATE TRIGGER prevent_payment_updates_trigger
    BEFORE UPDATE ON payment_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_payment_updates();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Payment logs: Users can only see their own payments
DROP POLICY IF EXISTS payment_logs_policy ON payment_logs;
CREATE POLICY payment_logs_policy ON payment_logs
  USING (user_id = auth.uid());

-- Payment logs: Admins can see all payments
DROP POLICY IF EXISTS payment_logs_admin_policy ON payment_logs;
CREATE POLICY payment_logs_admin_policy ON payment_logs
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Support requests: Users can see their own requests
DROP POLICY IF EXISTS support_requests_user_policy ON support_requests;
CREATE POLICY support_requests_user_policy ON support_requests
  USING (user_id = auth.uid());

-- Support requests: Admins can see all requests
DROP POLICY IF EXISTS support_requests_admin_policy ON support_requests;
CREATE POLICY support_requests_admin_policy ON support_requests
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Support requests: Support team can see all requests
DROP POLICY IF EXISTS support_requests_support_policy ON support_requests;
CREATE POLICY support_requests_support_policy ON support_requests
  USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'support'));

-- Pricing: Read access for all (public)
DROP POLICY IF EXISTS pricing_public_read_policy ON pricing;
CREATE POLICY pricing_public_read_policy ON pricing
  FOR SELECT USING (true);

-- Pricing: Admins can insert/update/delete
DROP POLICY IF EXISTS pricing_admin_write_policy ON pricing;
CREATE POLICY pricing_admin_write_policy ON pricing
  FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Composite index for payment_logs: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id_created_at ON payment_logs(user_id, created_at DESC);

-- Composite index for support_requests: (user_id, created_at)
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id_created_at ON support_requests(user_id, created_at DESC);

-- Composite index for support_requests: (user_id, status)
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id_status ON support_requests(user_id, status); 