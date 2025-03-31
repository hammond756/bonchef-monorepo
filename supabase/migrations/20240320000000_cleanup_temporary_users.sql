-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to delete temporary users older than 24 hours
CREATE OR REPLACE FUNCTION delete_old_temporary_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete auth.users entries for temporary users older than 24 hours
  -- Cascading will handle deletion of related records in other tables
  DELETE FROM auth.users
  WHERE email LIKE 'tijdelijke-bezoeker-%'
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Drop existing job if it exists
SELECT cron.unschedule('cleanup-temporary-users');

-- Create a scheduled job to run every hour
SELECT cron.schedule(
  'cleanup-temporary-users',
  '0 * * * *', -- Run every hour
  $$
  SELECT delete_old_temporary_users();
  $$
); 