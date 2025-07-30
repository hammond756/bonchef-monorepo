import { createClient } from "@/utils/supabase/server"
import {
    getBookmarkedRecipesWithClient,
    bookmarkRecipeWithClient,
    unbookmarkRecipeWithClient,
    isRecipeBookmarkedWithClient,
} from "./shared"
import { RecipeRead } from "@/lib/types"

export const getBookmarkedRecipes = async (): Promise<RecipeRead[]> => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return getBookmarkedRecipesWithClient(supabase, user)
}

export const bookmarkRecipe = async (recipeId: string): Promise<void> => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return bookmarkRecipeWithClient(supabase, recipeId, user)
}

export const unbookmarkRecipe = async (recipeId: string): Promise<void> => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("User not authenticated")
    }
    return unbookmarkRecipeWithClient(supabase, recipeId, user)
}

export const isRecipeBookmarked = async (recipeId: string): Promise<boolean> => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return false
    }
    return isRecipeBookmarkedWithClient(supabase, recipeId, user)
}
