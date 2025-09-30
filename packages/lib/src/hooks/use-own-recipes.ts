import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserRecipesWithClient, type RecipeDetail } from "../services/recipes";

export interface UseOwnRecipesOptions {
  supabaseClient: SupabaseClient;
  userId: string;
}

export interface UseOwnRecipesReturn {
  recipes: RecipeDetail[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  count: () => number;
}

/**
 * Hook for fetching user's own recipes
 * @param options - Configuration options including Supabase client and user ID
 * @returns User's recipes data and functions
 */
export function useOwnRecipes({ 
  supabaseClient, 
  userId 
}: UseOwnRecipesOptions): UseOwnRecipesReturn {
  const {
    data: recipes = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["own-recipes"],
    queryFn: () => getUserRecipesWithClient(supabaseClient, userId),
    enabled: !!userId,
  });

  const count = () => {
    if (!userId) {
      return 0;
    }
    return recipes?.length || 0;
  };

  return {
    recipes,
    isLoading,
    error: error as Error | null,
    refetch,
    count,
  };
}
