"use client"

import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getRecipeWithClient, RecipeRead } from "../services/recipes"
import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Hook to fetch a single recipe by ID
 * @param recipeId - The recipe ID to fetch
 * @returns Query result with recipe data
 */
export function useRecipe(supabase: SupabaseClient, recipeId: string | undefined) {
  return useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeWithClient(supabase, recipeId!),
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

