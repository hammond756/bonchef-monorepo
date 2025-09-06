-- Enable RLS for the table if not already enabled
-- Note: It's common for RLS to be enabled when the table is created.
-- This is a safeguard.
ALTER TABLE public.recipe_import_jobs ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to make this migration re-runnable
DROP POLICY IF EXISTS "Allow users to delete their own import jobs" ON public.recipe_import_jobs;

-- Create the new policy for DELETE
CREATE POLICY "Allow users to delete their own import jobs"
ON public.recipe_import_jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
