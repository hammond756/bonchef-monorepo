import { SupabaseClient } from "@supabase/supabase-js";
import { RecipeDetail } from "./recipes";

/**
 * Fetches bookmarked recipes for a user
 * @param client - Supabase client instance
 * @param userId - The user ID to fetch bookmarked recipes for
 * @returns Promise<RecipeRead[]> - Bookmarked recipes
 * @throws Error if database error occurs
 */
export async function getBookmarkedRecipesWithClient(
    client: SupabaseClient,
    userId: string
  ): Promise<RecipeDetail[]> {
    const { data, error } = await client
      .from("recipe_bookmarks")
      .select(`
        recipes!inner(
          *,
          profiles(display_name, id, avatar),
          is_bookmarked_by_current_user,
          is_liked_by_current_user,
          recipe_bookmarks(count),
          recipe_likes(count)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  
    if (error) {
      throw new Error(`Failed to fetch bookmarked recipes: ${error.message}`);
    }
  
    // Transform the data to match RecipeRead format
    const recipesWithCounts: RecipeDetail[] = (data || []).map((bookmark: any) => ({
      ...bookmark.recipes,
      bookmark_count: bookmark.recipes.recipe_bookmarks?.[0]?.count || 0,
      like_count: bookmark.recipes.recipe_likes?.[0]?.count || 0,
    }));
  
    return recipesWithCounts;
  }