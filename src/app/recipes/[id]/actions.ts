"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { unstable_cache } from 'next/cache'
import { SupabaseClient } from "@supabase/supabase-js"

// Cached version of the recipe fetching function for public recipes
const getPublicRecipeById = unstable_cache(
  async (supabase: SupabaseClient, id: string) => {
    // Get the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipe_creation_prototype")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .single()
    
    if (recipeError) {
      return null
    }
    
    return recipe
  },
  // Key for the cache
  ["public-recipe"],
  // Cache options
  { tags: ["recipes"], revalidate: 3600 }
)

export async function getRecipe(id: string) {
  const supabase = await createClient()
  
  // Try to get a public recipe first (which can be cached)
  const publicRecipe = await getPublicRecipeById(supabase, id)
  
  // If we found a public recipe, return it
  if (publicRecipe) {
    return publicRecipe
  }
  
  // If recipe was not public, check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session} } = await supabase.auth.getSession()
  if (!user) {
    console.log("Anonymous user can't view private recipes")
    return null
  }
  
  // Try to get the recipe as a logged in user (could be private)
  const { data: privateRecipe, error: recipeError } = await supabase
    .from("recipe_creation_prototype")
    .select("*")
    .eq("id", id)
    .single()
    
  if (recipeError) {
    if (recipeError.code === "PGRST116") {
      return null
    }
    throw new Error(recipeError.message)
  }
  
  return privateRecipe
}
