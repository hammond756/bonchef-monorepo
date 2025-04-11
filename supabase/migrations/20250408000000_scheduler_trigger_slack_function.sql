-- ONLY triggers the edge function in production environment (not locally)
-- This is a scheduled PostgreSQL function that runs every hour

-- Create the function that will trigger the edge function
CREATE OR REPLACE FUNCTION trigger_post_conversations_to_slack()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_production boolean;
BEGIN
  -- Check if we're running in production by looking at the current database name
  -- This is a simple heuristic - production DB usually has a different name than local
  SELECT current_database() NOT LIKE '%local%' 
    AND current_database() NOT LIKE 'postgres'
    AND current_database() NOT LIKE 'supabase%'
    INTO is_production;
  
  -- Only proceed if we're in production
  IF is_production THEN
    -- Make HTTP request to the edge function
    PERFORM
      net.http_post(
        url := 'https://lwnjybqifrnppmahxera.supabase.co/functions/v1/post-conversations-to-slack',
        headers := '{
          "Content-Type": "application/json",
          "Authorization": "Bearer " || current_setting(''app.edge_function_key'', true)
        }'::jsonb,
        body := '{}'::jsonb
      );
    
    -- Log that we triggered the function
    RAISE NOTICE 'Triggered post-conversations-to-slack function';
  ELSE
    -- Log that we skipped execution in non-production environment
    RAISE NOTICE 'Skipping post-conversations-to-slack trigger in development environment';
  END IF;
END;
$$;

-- Add app.edge_function_key setting if it doesn't exist
DO $$
BEGIN
  -- Check if the setting already exists
  IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name = 'app.edge_function_key') THEN
    -- Create the setting with a placeholder value
    -- You'll need to set the actual value in production
    PERFORM set_config('app.edge_function_key', 'placeholder_key', false);
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Skipping setting creation - requires superuser privileges';
END $$;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'trigger-post-conversations-to-slack',  -- unique job name
  '0 * * * *',                           -- cron schedule (every hour at minute 0)
  'SELECT trigger_post_conversations_to_slack()'
);

-- To manually set the edge function key in production:
-- Run this SQL in the production database:
-- ALTER DATABASE postgres SET app.edge_function_key = 'your_service_role_key_here'; 