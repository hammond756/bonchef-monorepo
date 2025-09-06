ALTER TABLE "public"."recipe_creation_prototype" RENAME TO "recipes";
ALTER TABLE "public"."recipe_likes" RENAME TO "recipe_bookmarks";

ALTER TABLE "public"."recipe_bookmarks" RENAME CONSTRAINT "recipe_likes_recipe_id_fkey" TO "recipe_bookmarks_recipe_id_fkey";
ALTER TABLE "public"."recipe_bookmarks" RENAME CONSTRAINT "recipe_likes_user_id_fkey" TO "recipe_bookmarks_user_id_fkey";
ALTER TABLE "public"."recipes" RENAME CONSTRAINT "recipe_creation_prototype_user_id_fkey" TO "recipes_user_id_fkey";

CREATE OR REPLACE FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipes") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipe_bookmarks
    WHERE recipe_id = rec.id AND user_id = auth.uid()
  );
$$;

ALTER FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipes") RENAME TO "is_bookmarked_by_current_user";
