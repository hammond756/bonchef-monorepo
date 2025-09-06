-- Rename existing indices
ALTER TABLE public.recipe_bookmarks RENAME CONSTRAINT recipe_likes_pkey TO recipe_bookmarks_pkey;
ALTER TABLE public.recipes RENAME CONSTRAINT recipe_creation_prototype_pkey TO recipes_pkey;

-- Create recipe_likes table for storing user likes on recipes
create table
  public.recipe_likes (
    id uuid not null default gen_random_uuid (),
    recipe_id uuid not null,
    user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint recipe_likes_pkey primary key (id),
    constraint recipe_likes_recipe_id_fkey foreign key (recipe_id) references recipes (id) on delete cascade,
    constraint recipe_likes_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
    constraint recipe_likes_unique_user_recipe unique (recipe_id, user_id)
  ) tablespace pg_default;

-- Create function to check if current user has liked a recipe
CREATE OR REPLACE FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipes") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipe_likes
    WHERE recipe_id = rec.id AND user_id = auth.uid()
  );
$$; 