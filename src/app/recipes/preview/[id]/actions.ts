"use server"

import { createAdminClient } from "@/utils/supabase/server"
import type { Recipe } from "@/lib/types"

export async function getPreviewRecipe(recipeId: string): Promise<Recipe | null> {
    const supabase = await createAdminClient()
    const marketingUserId = process.env.NEXT_PUBLIC_MARKETING_USER_ID

    if (!marketingUserId) {
        console.error("MARKETING_USER_ID is not set in environment variables.")
        return null
    }

    const { data, error } = await supabase
        .from("recipe_creation_prototype")
        .select("*, profiles!recipe_creation_prototype_user_id_fkey(display_name, id, avatar)")
        .eq("id", recipeId)
        .eq("user_id", marketingUserId)
        .single()

    if (error) {
        console.error(`Error fetching preview recipe for id ${recipeId}:`, error)
        return null
    }

    return data as Recipe | null
}
