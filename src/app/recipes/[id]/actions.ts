"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function getRecipe(id: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  if (!user) {
    redirect("/login")
  }

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

  return recipe
}
