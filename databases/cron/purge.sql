-- Purge comparisons older than 24 months for GDPR/CCPA compliance
-- This job should be scheduled via pg_cron or equivalent

-- Create audit and error log tables if they don't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id SERIAL PRIMARY KEY,
  operation TEXT NOT NULL,
  details TEXT,
  affected_rows INTEGER,
  executed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.error_log (
  id SERIAL PRIMARY KEY,
  operation TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_detail TEXT,
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Grant INSERT permission to cron user (replace 'cron_user' with actual user)
-- GRANT INSERT ON public.audit_log TO cron_user;
-- GRANT INSERT ON public.error_log TO cron_user;

DO $do$
DECLARE
  v_rows_deleted INTEGER := 0;
BEGIN
  BEGIN
    DELETE FROM public.comparisons
    WHERE created_at < (NOW() - INTERVAL '24 months');
    GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
    INSERT INTO public.audit_log (operation, details, affected_rows)
      VALUES ('purge_comparisons', 'Deleted comparisons older than 24 months', v_rows_deleted);
    COMMIT;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_log (operation, error_message, error_detail)
      VALUES ('purge_comparisons', SQLERRM, GET STACKED DIAGNOSTICS);
    ROLLBACK;
    RAISE;
  END;
END $do$;

-- To schedule this job in pg_cron (example):
-- SELECT cron.schedule('purge_old_comparisons', '0 3 * * *', $$<this script>$$);