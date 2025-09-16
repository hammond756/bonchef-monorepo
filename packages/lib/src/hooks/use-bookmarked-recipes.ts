import { useQuery } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { RecipeRead } from "../services/recipes";
import { getBookmarkedRecipesWithClient } from "../services/bookmarks";

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
