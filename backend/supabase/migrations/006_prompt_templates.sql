-- Schema for prompt_templates (PRD Section 6.2)
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT CHECK (template_type IN ('businessPlan', 'socialMedia', 'websiteAudit')),
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  INDEX idx_prompt_templates_type (template_type)
);
CREATE POLICY prompt_templates_rls ON prompt_templates
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Update prompt_logs to include template_version
ALTER TABLE prompt_logs
  ADD COLUMN template_version TEXT;
CREATE INDEX idx_prompt_logs_template_version ON prompt_logs (template_version);
