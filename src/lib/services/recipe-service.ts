import { SupabaseClient } from "@supabase/supabase-js";
import { RecipeWrite, RecipeWriteSchema, RecipeRead } from "../types";
import { NextResponse } from "next/server";


type ServiceResponse<T> = Promise<{
    success: false
    error: string
} | {
    success: true
    data: T
}>

export class RecipeService {
    private supabase: SupabaseClient

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase
    }

    private validateRecipe(recipe: RecipeWrite): {success: true, data: RecipeWrite} | {success: false, error: string} {
        const validatedRecipe = RecipeWriteSchema.safeParse(recipe)

        if (!validatedRecipe.success) {
            const errorMessages = validatedRecipe.error.issues.map((issue) => {
                const path = issue.path.join(".");
                return `${path}: ${issue.message}`;
            }).join(", ");

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
            .from("recipe_creation_prototype").insert(validatedRecipe.data)
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
            .from("recipe_creation_prototype").update(validatedRecipe.data).eq("id", id)
            .select("*")
            .single()

        if (error) {
            console.error(`Error updating recipe (status: ${status}):`, error)
            return { success: false, error: error.message || statusText }
        }

        return { success: true, data }
    }
}
