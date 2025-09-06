-- Create comments table
-- 
-- DESIGN DECISIONS FOR NESTED COMMENTS SUPPORT:
-- 1. UUID primary keys: Enable easy referencing in nested structures without ID conflicts
-- 2. Generic 'text' field: Flexible content storage for both comments and replies
-- 3. Timestamp fields: Essential for ordering in threaded discussions
-- 4. Cascade deletes: Maintain referential integrity when parent comments are deleted
-- 5. Indexes on recipe_id and created_at: Optimize queries for comment threads
-- 
-- FUTURE NESTED COMMENTS IMPLEMENTATION:
-- To add nested comments, simply add:
--   - parent_id uuid references comments(id) on delete cascade
--   - thread_id uuid (for grouping related comments)
--   - depth integer (for indentation levels)
--   - Index on (parent_id, created_at) for efficient thread queries
--
create table
  public.comments (
    id uuid not null default gen_random_uuid (),
    recipe_id uuid not null,
    user_id uuid not null,
    text text not null check (char_length(text) <= 500),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint comments_pkey primary key (id),
    constraint comments_recipe_id_fkey foreign key (recipe_id) references recipes (id) on delete cascade,
    constraint comments_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
  ) tablespace pg_default;

-- Create indexes for performance
-- These indexes support efficient querying for both flat and nested comment structures
create index idx_comments_recipe_id on public.comments (recipe_id);
create index idx_comments_created_at on public.comments (created_at desc);
create index idx_comments_user_id on public.comments (user_id);

-- Create function to get comment count for a recipe
CREATE OR REPLACE FUNCTION "public"."get_comment_count"("rec" "public"."recipes") RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COUNT(*) FROM public.comments WHERE recipe_id = rec.id;
$$;

-- Create function to check if current user has commented on a recipe
CREATE OR REPLACE FUNCTION "public"."has_comment_by_current_user"("rec" "public"."recipes") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.comments 
    WHERE recipe_id = rec.id 
    AND user_id = auth.uid()
  );
$$;
