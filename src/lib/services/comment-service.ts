import { createClient } from "@/utils/supabase/server"
import { Comment, CreateComment, ServiceResponse } from "@/lib/types"

/**
 * Fetches all comments for a specific recipe
 */
export async function getCommentsForRecipe(recipeId: string): Promise<ServiceResponse<Comment[]>> {
    try {
        const supabase = await createClient()

        const { data: comments, error } = await supabase
            .from("comments")
            .select(
                `
                id,
                recipe_id,
                user_id,
                text,
                created_at,
                updated_at,
                profiles:user_id (
                    id,
                    display_name,
                    avatar
                )
            `
            )
            .eq("recipe_id", recipeId)
            .order("created_at", { ascending: false })

        if (error) {
            return {
                success: false,
                error: `Failed to fetch comments: ${error.message}`,
            }
        }

        return {
            success: true,
            data: comments as unknown as Comment[],
        }
    } catch (error) {
        return {
            success: false,
            error: `Unexpected error fetching comments: ${error instanceof Error ? error.message : "Unknown error"}`,
        }
    }
}

/**
 * Creates a new comment for a recipe
 */
export async function createComment(commentData: CreateComment): Promise<ServiceResponse<Comment>> {
    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
            return {
                success: false,
                error: "User not authenticated",
            }
        }

        // Insert the comment
        const { data: comment, error } = await supabase
            .from("comments")
            .insert({
                recipe_id: commentData.recipe_id,
                user_id: user.id,
                text: commentData.text,
            })
            .select(
                `
                id,
                recipe_id,
                user_id,
                text,
                created_at,
                updated_at,
                profiles:user_id (
                    id,
                    display_name,
                    avatar
                )
            `
            )
            .single()

        if (error) {
            return {
                success: false,
                error: `Failed to create comment: ${error.message}`,
            }
        }

        return {
            success: true,
            data: comment as unknown as Comment,
        }
    } catch (error) {
        return {
            success: false,
            error: `Unexpected error creating comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        }
    }
}

/**
 * Deletes a comment (only by the comment owner)
 */
export async function deleteComment(commentId: string): Promise<ServiceResponse<void>> {
    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
            return {
                success: false,
                error: "User not authenticated",
            }
        }

        // Delete the comment (only if user owns it)
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId)
            .eq("user_id", user.id)

        if (error) {
            return {
                success: false,
                error: `Failed to delete comment: ${error.message}`,
            }
        }

        return {
            success: true,
            data: undefined,
        }
    } catch (error) {
        return {
            success: false,
            error: `Unexpected error deleting comment: ${error instanceof Error ? error.message : "Unknown error"}`,
        }
    }
}

/**
 * Gets the comment count for a recipe
 */
export async function getCommentCount(recipeId: string): Promise<ServiceResponse<number>> {
    try {
        const supabase = await createClient()

        const { count, error } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("recipe_id", recipeId)

        if (error) {
            return {
                success: false,
                error: `Failed to get comment count: ${error.message}`,
            }
        }

        return {
            success: true,
            data: count || 0,
        }
    } catch (error) {
        return {
            success: false,
            error: `Unexpected error getting comment count: ${error instanceof Error ? error.message : "Unknown error"}`,
        }
    }
}
