-- Add RLS policies for comments table
-- Only logged in users can create comments, only owner (user_id) can update or delete comment. Anyone can read comments.

-- Enable RLS on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments" ON public.comments
    FOR SELECT USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow comment owners to update their own comments
CREATE POLICY "Comment owners can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow comment owners to delete their own comments
CREATE POLICY "Comment owners can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for onboarding_associations table
-- Only admin can do anything on this table

-- Enable RLS on onboarding_associations table
ALTER TABLE public.onboarding_associations ENABLE ROW LEVEL SECURITY;

-- Only allow service_role (admin) to perform all operations
CREATE POLICY "Only admin can access onboarding_associations" ON public.onboarding_associations
    FOR ALL TO service_role USING (true);

-- Add RLS policies for recipe_likes table
-- Same as comments: only logged in users can create likes, only owner (user_id) can delete like. Anyone can read likes.

-- Drop existing policies for recipe_likes to replace them
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.recipe_likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.recipe_likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.recipe_likes;

-- Enable RLS on recipe_likes table (if not already enabled)
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read likes
CREATE POLICY "Anyone can read recipe likes" ON public.recipe_likes
    FOR SELECT USING (true);

-- Allow authenticated users to create likes
CREATE POLICY "Authenticated users can create recipe likes" ON public.recipe_likes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow like owners to delete their own likes
CREATE POLICY "Like owners can delete their own likes" ON public.recipe_likes
    FOR DELETE USING (auth.uid() = user_id);
