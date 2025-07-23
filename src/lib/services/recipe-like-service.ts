import { SupabaseClient } from "@supabase/supabase-js"
import { ServiceResponse } from "@/lib/types"

interface ToggleLikeResult {
    isLiked: boolean
    likeCount: number
}

/**
 * Service for managing recipe likes
 */
export class RecipeLikeService {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Toggle like status for a recipe by a user
     * If user has already liked the recipe, it will be unliked
     * If user has not liked the recipe, it will be liked
     */
    async toggleLike(recipeId: string, userId: string): ServiceResponse<ToggleLikeResult> {
        try {
            // Check if user has already liked this recipe
            const { data: existingLike, error: checkError } = await this.supabase
                .from("recipe_likes")
                .select("id")
                .eq("recipe_id", recipeId)
                .eq("user_id", userId)
                .single()

            if (checkError && checkError.code !== "PGRST116") {
                // PGRST116 = no rows returned, which is expected when like doesn't exist
                return {
                    success: false,
                    error: `Error checking existing like: ${checkError.message}`,
                }
            }

            let isLiked: boolean

            if (existingLike) {
                // Unlike: remove the existing like
                const { error: deleteError } = await this.supabase
                    .from("recipe_likes")
                    .delete()
                    .eq("recipe_id", recipeId)
                    .eq("user_id", userId)

                if (deleteError) {
                    return {
                        success: false,
                        error: `Error removing like: ${deleteError.message}`,
                    }
                }

                isLiked = false
            } else {
                // Like: create new like
                const { error: insertError } = await this.supabase.from("recipe_likes").insert({
                    recipe_id: recipeId,
                    user_id: userId,
                })

                if (insertError) {
                    return {
                        success: false,
                        error: `Error adding like: ${insertError.message}`,
                    }
                }

                isLiked = true
            }

            // Get updated like count
            const { count: likeCount, error: countError } = await this.supabase
                .from("recipe_likes")
                .select("*", { count: "exact" })
                .eq("recipe_id", recipeId)

            if (countError) {
                return {
                    success: false,
                    error: `Error getting like count: ${countError.message}`,
                }
            }

            return {
                success: true,
                data: {
                    isLiked,
                    likeCount: likeCount || 0,
                },
            }
        } catch (error) {
            return {
                success: false,
                error: `Unexpected error in toggleLike: ${error instanceof Error ? error.message : String(error)}`,
            }
        }
    }

    /**
     * Get like count and user like status for a recipe
     */
    async getLikeStatus(recipeId: string, userId?: string): ServiceResponse<ToggleLikeResult> {
        try {
            // Get like count
            const { count: likeCount, error: countError } = await this.supabase
                .from("recipe_likes")
                .select("*", { count: "exact" })
                .eq("recipe_id", recipeId)

            if (countError) {
                return {
                    success: false,
                    error: `Error getting like count: ${countError.message}`,
                }
            }

            let isLiked = false

            // Check if user has liked this recipe (only if userId provided)
            if (userId) {
                const { data: userLike, error: userLikeError } = await this.supabase
                    .from("recipe_likes")
                    .select("id")
                    .eq("recipe_id", recipeId)
                    .eq("user_id", userId)
                    .single()

                if (userLikeError && userLikeError.code !== "PGRST116") {
                    return {
                        success: false,
                        error: `Error checking user like status: ${userLikeError.message}`,
                    }
                }

                isLiked = !!userLike
            }

            return {
                success: true,
                data: {
                    isLiked,
                    likeCount: likeCount || 0,
                },
            }
        } catch (error) {
            return {
                success: false,
                error: `Unexpected error in getLikeStatus: ${error instanceof Error ? error.message : String(error)}`,
            }
        }
    }
}
