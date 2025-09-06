import { SupabaseClient, User } from "@supabase/supabase-js"
import { Comment, CreateComment } from "@/lib/types"

/**
 * Fetches all comments for a specific recipe
 */
export async function getCommentsForRecipeWithClient(
    client: SupabaseClient,
    recipeId: string
): Promise<Comment[]> {
    const { data, error } = await client
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
        throw new Error(`Failed to fetch comments: ${error.message}`)
    }

    // Flatten the profiles array for cleaner data access throughout the app
    const comments = data.map((comment) => ({
        id: comment.id,
        recipe_id: comment.recipe_id,
        user_id: comment.user_id,
        text: comment.text,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        // Somehow the supabase client types the profiles as an array, but it's actually an object
        profile: comment.profiles as unknown as {
            id: string
            display_name: string
            avatar: string
        },
    }))

    return comments
}

/**
 * Creates a new comment for a recipe
 */
export async function createCommentWithClient(
    client: SupabaseClient,
    commentData: CreateComment,
    user: User
): Promise<Comment> {
    const { data: comment, error } = await client
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
        throw new Error(`Failed to create comment: ${error.message}`)
    }

    const newComment = {
        id: comment.id,
        recipe_id: comment.recipe_id,
        user_id: comment.user_id,
        text: comment.text,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        profile: comment.profiles as unknown as {
            id: string
            display_name: string
            avatar: string
        },
    }

    return newComment
}

/**
 * Deletes a comment (only by the comment owner)
 */
export async function deleteCommentWithClient(
    client: SupabaseClient,
    commentId: string,
    user: User
): Promise<void> {
    const { error } = await client
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id)

    if (error) {
        throw new Error(`Failed to delete comment: ${error.message}`)
    }
}

/**
 * Gets the comment count for a recipe
 */
export async function getCommentCountWithClient(
    client: SupabaseClient,
    recipeId: string
): Promise<number> {
    const { count, error } = await client
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)

    if (error) {
        throw new Error(`Failed to get comment count: ${error.message}`)
    }

    return count || 0
}
