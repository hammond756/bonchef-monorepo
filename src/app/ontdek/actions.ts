"use server"

import { createClient } from "@/utils/supabase/server"

export async function bookmarkRecipe(recipeId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("recipe_bookmarks").insert({ recipe_id: recipeId })

    if (error) {
        if (error.code === "42501") {
            console.error("Error bookmarking recipe:", error)
            return {
                success: false,
                error: { code: 401, message: "Log in om een recept te bookmarken" },
            }
        } else {
            console.error("Error bookmarking recipe:", error)
            return { success: false, error: { code: 500, message: "Er is iets misgegaan" } }
        }
    }

    return { success: true, error: null }
}

export async function unbookmarkRecipe(recipeId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("recipe_bookmarks").delete().eq("recipe_id", recipeId)

    if (error) {
        console.error("Error unbookmarking recipe:", error)
        return { success: false, error: { code: 500, message: "Er is iets misgegaan" } }
    }

    return { success: true, error: null }
}
