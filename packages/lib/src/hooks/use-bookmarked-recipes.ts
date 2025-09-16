import { useQuery } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { RecipeRead } from "../services/recipes";

export interface UseBookmarkedRecipesOptions {
  supabaseClient: SupabaseClient;
  userId: string;
}

export interface UseBookmarkedRecipesReturn {
  recipes: RecipeRead[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches bookmarked recipes for a user
 * @param client - Supabase client instance
 * @param userId - The user ID to fetch bookmarked recipes for
 * @returns Promise<RecipeRead[]> - Bookmarked recipes
 * @throws Error if database error occurs
 */
async function getBookmarkedRecipesWithClient(
  client: SupabaseClient,
  userId: string
): Promise<RecipeRead[]> {
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
  const recipesWithCounts: RecipeRead[] = (data || []).map((bookmark) => ({
    ...bookmark.recipes,
    bookmark_count: bookmark.recipes.recipe_bookmarks?.[0]?.count || 0,
    like_count: bookmark.recipes.recipe_likes?.[0]?.count || 0,
  }));

  return recipesWithCounts;
}

/**
 * Hook for fetching bookmarked recipes
 * @param options - Configuration options including Supabase client and user ID
 * @returns Bookmarked recipes data and functions
 */
export function useBookmarkedRecipes({ 
  supabaseClient, 
  userId 
}: UseBookmarkedRecipesOptions): UseBookmarkedRecipesReturn {
  const {
    data: recipes = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bookmarked-recipes", userId],
    queryFn: () => getBookmarkedRecipesWithClient(supabaseClient, userId),
    enabled: !!userId,
  });

  return {
    recipes,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
