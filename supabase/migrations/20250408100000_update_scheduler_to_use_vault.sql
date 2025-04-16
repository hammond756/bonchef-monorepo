-- Update the scheduler function to use Supabase Vault instead of database settings
-- First, let's create secrets in the vault for our project URL and edge function key

-- Store the project URL in vault
SELECT vault.create_secret(
  'https://lwnjybqifrnppmahxera.supabase.co', 
  'project_url'
);

-- Store the edge function key in vault
-- Note: In production, replace 'your_service_role_key_here' with your actual service role key
SELECT vault.create_secret(
  'your_service_role_key_here', 
  'slack_post_edge_function_service_role_key'
);

-- Update the function that triggers the edge function to use vault
CREATE OR REPLACE FUNCTION trigger_post_conversations_to_slack()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_production boolean;
  project_url text;
  auth_key text;
BEGIN
  -- Check if we're running in production by looking at the current database name
  SELECT current_database() NOT LIKE '%local%' 
    AND current_database() NOT LIKE 'postgres'
    AND current_database() NOT LIKE 'supabase%'
    INTO is_production;
  
  -- Only proceed if we're in production
  IF is_production THEN
    -- Get secrets from vault
    SELECT decrypted_secret INTO project_url
    FROM vault.decrypted_secrets 
    WHERE name = 'project_url';
    
    SELECT decrypted_secret INTO auth_key
    FROM vault.decrypted_secrets 
    WHERE name = 'slack_post_edge_function_service_role_key';
    
    -- Make HTTP request to the edge function
    PERFORM
      net.http_post(
        url := project_url || '/functions/v1/post-conversations-to-slack',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_key
        ),
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

-- No need for the DO block that sets app.edge_function_key anymore, as we're using vault

-- The cron schedule remains the same
-- If the cron job already exists, we need to update it
SELECT cron.unschedule('trigger-post-conversations-to-slack');

SELECT cron.schedule(
  'trigger-post-conversations-to-slack',  -- unique job name
  '0 * * * *',                           -- cron schedule (every hour at minute 0)
  'SELECT trigger_post_conversations_to_slack()'
);

-- No need to manually set the edge function key in production anymore
-- Just update the secret in the vault using:
-- SELECT vault.update_secret('secret_uuid', 'your_actual_service_role_key'); 

-- TODO: figure out why the edge function is not triggered, while the cron job is working. I think it might be the is_production check.