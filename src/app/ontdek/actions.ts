"use server"

import { createClient } from "@/utils/supabase/server"

export async function likeRecipe(recipeId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("recipe_likes").insert({ recipe_id: recipeId })

    if (error) {
        if (error.code === "42501") {
            console.error("Error liking recipe:", error)
            throw new Error("Log in om een recept te liken")
        } else {
            console.error("Error liking recipe:", error)
            throw error
        }
    }
}

export async function unlikeRecipe(recipeId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("recipe_likes").delete().eq("recipe_id", recipeId)

    if (error) {
        console.error("Error unliking recipe:", error)
        throw error
    }
}
