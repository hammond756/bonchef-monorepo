-- Remove the trigger function for posting conversations to Slack
-- This reverts the creation of the trigger function that was associated with the removed edge function

-- Drop any existing cron jobs that might be calling this function
-- Only attempt this if pg_cron extension is installed
DO $$
BEGIN
  -- Check if pg_cron extension is installed
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_cron'
  ) THEN
    -- Check if the cron job exists and remove it
    IF EXISTS (
      SELECT 1 FROM cron.job 
      WHERE jobname = 'trigger-post-conversations-to-slack'
    ) THEN
      PERFORM cron.unschedule('trigger-post-conversations-to-slack');
    END IF;
  END IF;
END;
$$;

-- Drop the trigger function
DROP FUNCTION IF EXISTS "public"."trigger_post_conversations_to_slack"();
