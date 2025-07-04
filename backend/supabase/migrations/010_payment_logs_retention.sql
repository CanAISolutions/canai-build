-- Migration: Add monthly data retention for payment_logs (MVP)
-- Purges records older than 24 months to comply with PRD and legal/accounting requirements

-- Ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron job (runs on the 1st of every month at 2:00 AM UTC)
SELECT cron.schedule(
  'purge_old_payment_logs',
  '0 2 1 * *',
  $$
    DELETE FROM payment_logs
    WHERE created_at < (NOW() - INTERVAL '24 months');
  $$
);

-- To remove the job, use:
-- SELECT cron.unschedule('purge_old_payment_logs');

-- MVP: No archiving, just purge. No user-facing controls.

