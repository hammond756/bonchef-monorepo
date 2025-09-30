import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecipeDetail } from "../services/recipes";
import { getBookmarkedRecipesWithClient } from "../services/bookmarks";

export interface UseBookmarkedRecipesOptions {
  supabaseClient: SupabaseClient;
  userId: string;
}

export interface UseBookmarkedRecipesReturn {
  recipes: RecipeDetail[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
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
    queryKey: ["bookmarked-recipes"],
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
