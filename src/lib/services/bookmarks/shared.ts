import { SupabaseClient, User } from "@supabase/supabase-js"
import { RecipeRead } from "@/lib/types"

/**
 * Fetches all bookmarked recipes for the current user
 */
export async function getBookmarkedRecipesWithClient(
    client: SupabaseClient,
    user: User
): Promise<RecipeRead[]> {
    const { data, error } = await client
        .from("recipe_bookmarks")
        .select(
            `
            recipe_id,
            recipes (
                id,
                title,
                description,
                thumbnail,
                is_public,
                created_at,
                updated_at,
                profiles:user_id (
                    id,
                    display_name,
                    avatar
                )
            )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        if (error.code === "PGRST116") {
            return []
        }
        throw new Error(`Failed to fetch bookmarked recipes: ${error.message}`)
    }

    // Transform the data to match RecipeRead type
    const recipes = data.map((bookmark) => bookmark.recipes) as unknown as RecipeRead[]

    return recipes
}

/**
 * Adds a recipe to the user's bookmarks
 */
export async function bookmarkRecipeWithClient(
    client: SupabaseClient,
    recipeId: string,
    user: User
): Promise<void> {
    const { error } = await client
        .from("recipe_bookmarks")
        .insert({ recipe_id: recipeId, user_id: user.id })

    if (error) {
        if (error.code === "42501") {
            throw new Error("Authentication required")
        }
        throw new Error(`Failed to bookmark recipe: ${error.message}`)
    }
}

/**
 * Removes a recipe from the user's bookmarks
 */
export async function unbookmarkRecipeWithClient(
    client: SupabaseClient,
    recipeId: string,
    user: User
): Promise<void> {
    const { error } = await client
        .from("recipe_bookmarks")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)

    if (error) {
        throw new Error(`Failed to unbookmark recipe: ${error.message}`)
    }
}

/**
 * Checks if a recipe is bookmarked by the current user
 */
export async function isRecipeBookmarkedWithClient(
    client: SupabaseClient,
    recipeId: string,
    user: User
): Promise<boolean> {
    const { data, error } = await client
        .from("recipe_bookmarks")
        .select("recipe_id")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)
        // Because a missing records means not bookmarked
        .maybeSingle()

    if (error) {
        throw new Error(`Failed to check bookmark status: ${error.message}`)
    }

    return !!data
}

export async function getRecipeBookmarkCountWithClient(
    client: SupabaseClient,
    recipeId: string
): Promise<number> {
    const { count, error } = await client
        .from("recipe_bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)

    if (error) {
        throw new Error(`Failed to get recipe bookmark count: ${error.message}`)
    }

    return count || 0
}
