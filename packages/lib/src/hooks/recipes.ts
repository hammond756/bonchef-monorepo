"use client"

import type { SupabaseClient } from "@supabase/supabase-js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    deleteRecipeWithClient,
    getRecipeDetailWithClient,
    getRecipeWithClient,
    updateRecipeWithClient,
    type RecipeUpdate
} from "../services/recipes"

/**
 * Hook to fetch a single recipe by ID, joining in other tables
 * like profiles, recipe_bookmarks, recipe_likes, etc.
 * @param supabase - Supabase client instance
 * @param recipeId - The recipe ID to fetch
 * @returns Query result with recipe data
 */
export function useRecipeDetail(supabase: SupabaseClient, recipeId: string | undefined) {
  return useQuery({
    queryKey: ["recipe", recipeId, "detail"],
    queryFn: () => getRecipeDetailWithClient(supabase, recipeId as string),
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}


/**
 * Hook to fetch a single recipe by ID, just the recipe table
 * @param supabase - Supabase client instance
 * @param recipeId - The recipe ID to fetch
 * @returns Query result with recipe data
 */
export function useRecipe(supabase: SupabaseClient, recipeId: string | undefined) {
  return useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeWithClient(supabase, recipeId as string),
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}


/**
 * Hook to update a recipe
 * @param supabase - Supabase client instance
 * @returns Mutation object for updating recipes
 */
export function useUpdateRecipe(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recipeId, updates }: { 
      recipeId: string
      updates: Partial<RecipeUpdate>
    }) => updateRecipeWithClient(supabase, recipeId, updates),
    onSuccess: (updatedRecipe) => {
      // Update the specific recipe in cache
      queryClient.invalidateQueries({ queryKey: ["recipe", updatedRecipe.id] })
      
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
      queryClient.invalidateQueries({ queryKey: ["own-recipes"] })
      queryClient.invalidateQueries({ queryKey: ["public-recipes"] })
      queryClient.invalidateQueries({ queryKey: ["bookmarked-recipes"] })   
    },
  })
}

/**
 * Hook to delete a recipe
 * @param supabase - Supabase client instance
 * @returns Mutation object for deleting recipes
 */
export function useDeleteRecipe(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipeId: string) => deleteRecipeWithClient(supabase, recipeId),
    onSuccess: (_, recipeId) => {
      // Remove the recipe from cache
      queryClient.removeQueries({ queryKey: ["recipe", recipeId] })
      
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
      queryClient.invalidateQueries({ queryKey: ["own-recipes"] })
      queryClient.invalidateQueries({ queryKey: ["public-recipes"] })
      queryClient.invalidateQueries({ queryKey: ["bookmarked-recipes"] })
    },
  })
}
