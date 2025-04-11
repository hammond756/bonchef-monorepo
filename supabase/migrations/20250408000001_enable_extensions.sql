-- Enable the required extensions for HTTP requests and cron scheduling
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;

-- Ensure the cron schema tables are accessible 
ALTER DEFAULT PRIVILEGES IN SCHEMA cron GRANT SELECT ON TABLES TO postgres;

-- Make sure cron is in the search path
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_namespace ns
    JOIN pg_proc pr ON pr.pronamespace = ns.oid
    WHERE ns.nspname = 'cron' 
    AND pr.proname = 'schedule'
  ) THEN
    RAISE NOTICE 'The pg_cron extension appears to be installed but the cron.schedule function is not available.';
    RAISE NOTICE 'You may need to ensure that pg_cron is properly configured in postgresql.conf.';
  END IF;
END
$$; 