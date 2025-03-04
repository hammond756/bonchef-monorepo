"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function getRecipe(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  // Get the recipe
  const { data: recipe, error: recipeError } = await supabase
    .from("recipe_creation_prototype")
    .select("*")
    .eq("id", id)
    .single()

  if (recipeError) {
    console.error(recipeError)
    if (recipeError.code === "PGRST116") {
      return null
    }
    throw new Error(recipeError.message)
  }

  // Check if the recipe is public or if the user is the owner
  if (!recipe.is_public && (!user || recipe.user_id !== user.id)) {
    // If not logged in or not the owner of a private recipe, redirect to login
    if (!user) {
      redirect("/login")
    }
    // If logged in but not the owner of a private recipe, return null (not found)
    return null
  }

  return recipe
}
