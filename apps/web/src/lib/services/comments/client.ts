"use client"

import { createClient } from "@/utils/supabase/client"
import {
    getCommentsForRecipeWithClient,
    createCommentWithClient,
    deleteCommentWithClient,
    getCommentCountWithClient,
} from "./shared"
import { CreateComment, Comment } from "@/lib/types"

export const getCommentsForRecipe = (recipeId: string): Promise<Comment[]> => {
    const supabase = createClient()
    return getCommentsForRecipeWithClient(supabase, recipeId)
}

export const createComment = async (commentData: CreateComment): Promise<Comment> => {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }

    return createCommentWithClient(supabase, commentData, user)
}

export const deleteComment = async (commentId: string): Promise<void> => {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return deleteCommentWithClient(supabase, commentId, user)
}

export const getCommentCount = (recipeId: string): Promise<number> => {
    const supabase = createClient()
    return getCommentCountWithClient(supabase, recipeId)
}
