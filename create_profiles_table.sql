-- Create the profiles table with a foreign key to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
-- Allow users to view any profile (needed for public recipes to show author names)
CREATE POLICY "Allow users to view any profile" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to delete only their own profile
CREATE POLICY "Allow users to delete their own profile" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pre-fill the profiles table with existing users
-- This ensures that every auth.users entry has a corresponding profiles entry
INSERT INTO public.profiles (id)
SELECT id
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Migrate the foreign key from recipe_creation_prototype to profiles
-- First, check if the foreign key exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recipe_creation_prototype_user_id_fkey'
    AND table_name = 'recipe_creation_prototype'
  ) THEN
    -- Before dropping the constraint, ensure all user_ids in recipe_creation_prototype
    -- have corresponding entries in the profiles table
    -- This is a safety check to prevent orphaned records
    INSERT INTO public.profiles (id)
    SELECT DISTINCT user_id
    FROM public.recipe_creation_prototype
    WHERE user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = user_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Now it's safe to drop the constraint
    ALTER TABLE public.recipe_creation_prototype 
    DROP CONSTRAINT recipe_creation_prototype_user_id_fkey;
  END IF;
END $$;

-- Add the new foreign key to profiles
-- This maintains the same relationship, just pointing to profiles.id instead of auth.users.id
-- Since profiles.id is the same as auth.users.id, the relationship is preserved
ALTER TABLE public.recipe_creation_prototype
ADD CONSTRAINT recipe_creation_prototype_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, anon, authenticated; 