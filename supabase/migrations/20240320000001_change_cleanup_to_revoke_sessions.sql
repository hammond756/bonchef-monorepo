-- Drop existing job if it exists
SELECT cron.unschedule('cleanup-temporary-users');

-- Create a function to revoke sessions for temporary users older than 24 hours
CREATE OR REPLACE FUNCTION revoke_old_temporary_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Revoke all sessions for temporary users older than 24 hours
  -- This effectively logs them out and prevents them from logging back in
  -- since they don't know their passwords
  DELETE FROM auth.sessions
  WHERE user_id IN (
    SELECT id
    FROM auth.users
    WHERE email LIKE 'tijdelijke-bezoeker-%'
    AND created_at < NOW() - INTERVAL '24 hours'
  );
END;
$$;

-- Create a scheduled job to run every hour
SELECT cron.schedule(
  'cleanup-temporary-users',
  '0 * * * *', -- Run every hour
  $$
  SELECT revoke_old_temporary_users();
  $$
); 