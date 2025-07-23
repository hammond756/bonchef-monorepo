import { SupabaseClient } from "@supabase/supabase-js"
import { type RecipeWrite, RecipeWriteSchema, type RecipeRead, ServiceResponse } from "@/lib/types"

export class RecipeService {
    private supabase: SupabaseClient

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase
    }

    private validateRecipe(
        recipe: RecipeWrite
    ): { success: true; data: RecipeWrite } | { success: false; error: string } {
        const validatedRecipe = RecipeWriteSchema.safeParse(recipe)

        if (!validatedRecipe.success) {
            const errorMessages = validatedRecipe.error.issues
                .map((issue) => {
                    const path = issue.path.join(".")
                    return `${path}: ${issue.message}`
                })
                .join(", ")

            return { success: false, error: `Invalid recipe data: ${errorMessages}` }
        }

        return { success: true, data: validatedRecipe.data }
    }

    async createRecipe(recipe: RecipeWrite): ServiceResponse<RecipeRead> {
        const validatedRecipe = this.validateRecipe(recipe)

        if (!validatedRecipe.success) {
            return { success: false, error: validatedRecipe.error }
        }

        const { data, error, status, statusText } = await this.supabase
            .from("recipes")
            .insert(validatedRecipe.data)
            .select("*")
            .single()

        if (error) {
            console.error(`Error creating recipe (status: ${status}):`, error)
            return { success: false, error: error.message || statusText }
        }

        return { success: true, data }
    }

    async updateRecipe(id: string, recipe: RecipeWrite): ServiceResponse<RecipeRead> {
        const validatedRecipe = this.validateRecipe(recipe)

        if (!validatedRecipe.success) {
            return { success: false, error: validatedRecipe.error }
        }

        const { data, error, status, statusText } = await this.supabase
            .from("recipes")
            .update(validatedRecipe.data)
            .eq("id", id)
            .select("*")
            .single()

        if (error) {
            console.error(`Error updating recipe (status: ${status}):`, error)
            return { success: false, error: error.message || statusText }
        }

        return { success: true, data }
    }

    async getRecipe(id: string): ServiceResponse<RecipeRead> {
        const { data, error } = await this.supabase.from("recipes").select().eq("id", id).single()

        if (error) {
            console.error("Failed to get recipe:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    }

    /**
     * Updates the user ID for a list of recipes.
     * @param recipeIds The IDs of the recipes to update.
     * @param userId The ID of the new user to associate the recipes with.
     * @returns A service response indicating success or failure.
     */
    async assignRecipesToUser(recipeIds: string[], userId: string): ServiceResponse<null> {
        if (recipeIds.length === 0) {
            return { success: true, data: null }
        }

        const { error } = await this.supabase
            .from("recipes")
            .update({ user_id: userId })
            .in("id", recipeIds)

        if (error) {
            console.error("Failed to assign recipes to user:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data: null }
    }
}
