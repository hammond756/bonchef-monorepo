import { SupabaseClient, User } from "@supabase/supabase-js"

/**
 * Checks if a recipe is liked by the current user
 */
export async function isRecipeLikedWithClient(
    client: SupabaseClient,
    recipeId: string,
    user: User
): Promise<boolean> {
    const { data, error } = await client
        .from("recipe_likes")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        throw new Error(`Failed to check like status: ${error.message}`)
    }

    return !!data
}

/**
 * Adds a like to a recipe
 */
export async function likeRecipeWithClient(
    client: SupabaseClient,
    recipeId: string,
    user: User
): Promise<void> {
    const { error } = await client
        .from("recipe_likes")
        .insert({ recipe_id: recipeId, user_id: user.id })

    if (error) {
        if (error.code === "42501") {
            throw new Error("Authentication required")
        }
        throw new Error(`Failed to like recipe: ${error.message}`)
    }
}

/**
 * Removes a like from a recipe
 */
export async function unlikeRecipeWithClient(
    client: SupabaseClient,
    recipeId: string,
    user: User
): Promise<void> {
    const { error } = await client
        .from("recipe_likes")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)

    if (error) {
        throw new Error(`Failed to unlike recipe: ${error.message}`)
    }
}

/**
 * Gets the like count for a recipe
 */
export async function getRecipeLikeCountWithClient(
    client: SupabaseClient,
    recipeId: string
): Promise<number> {
    const { count, error } = await client
        .from("recipe_likes")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)

    if (error) {
        throw new Error(`Failed to get recipe like count: ${error.message}`)
    }

    return count || 0
}
