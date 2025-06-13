"use server"

import { RecipeService } from "@/lib/services/recipe-service"
import { RecipeWrite } from "@/lib/types"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function deleteRecipe(recipeId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { error } = await supabase.from("recipe_creation_prototype").delete().eq("id", recipeId)

    if (error) {
        throw error
    }
}

export async function updateRecipe(id: string, recipe: RecipeWrite) {
    const supabase = await createAdminClient()

    const recipeService = new RecipeService(supabase)

    const response = await recipeService.updateRecipe(id, recipe)

    if (!response.success) {
        throw new Error(response.error)
    }

    return response.data
}
