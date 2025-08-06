"use client"

import { createClient } from "@/utils/supabase/client"
import {
    isRecipeLikedWithClient,
    likeRecipeWithClient,
    unlikeRecipeWithClient,
    getRecipeLikeCountWithClient,
} from "./shared"

export const isRecipeLiked = async (recipeId: string): Promise<boolean> => {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return false
    }
    return isRecipeLikedWithClient(supabase, recipeId, user)
}

export const likeRecipe = async (recipeId: string): Promise<void> => {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return likeRecipeWithClient(supabase, recipeId, user)
}

export const unlikeRecipe = async (recipeId: string): Promise<void> => {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return unlikeRecipeWithClient(supabase, recipeId, user)
}

export const getRecipeLikeCount = async (recipeId: string): Promise<number> => {
    const supabase = createClient()
    return getRecipeLikeCountWithClient(supabase, recipeId)
}
