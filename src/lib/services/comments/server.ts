import { createClient } from "@/utils/supabase/server"
import {
    getCommentsForRecipeWithClient,
    createCommentWithClient,
    deleteCommentWithClient,
    getCommentCountWithClient,
} from "./shared"
import { CreateComment, Comment } from "@/lib/types"

export const getCommentsForRecipe = async (recipeId: string): Promise<Comment[]> => {
    const supabase = await createClient()
    return getCommentsForRecipeWithClient(supabase, recipeId)
}

export const createComment = async (commentData: CreateComment): Promise<Comment> => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return createCommentWithClient(supabase, commentData, user)
}

export const deleteComment = async (commentId: string): Promise<void> => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return deleteCommentWithClient(supabase, commentId, user)
}

export const getCommentCount = async (recipeId: string): Promise<number> => {
    const supabase = await createClient()
    return getCommentCountWithClient(supabase, recipeId)
}
