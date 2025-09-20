import { SupabaseClient } from "@supabase/supabase-js"
import { GeneratedRecipeWithSourceAndThumbnail } from "../web-service"
import { RecipeService } from "../recipe-service"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"

export async function createDraftRecipeWithClient(
    client: SupabaseClient,
    userId: string,
    recipe: GeneratedRecipeWithSourceAndThumbnail & { created_at?: string }
): Promise<{ id: string }> {
    const recipeService = new RecipeService(client)

    const savedRecipe = await recipeService.createRecipe({
        ...recipe,
        status: "DRAFT",
        is_public: false,
        source_url: recipe.source_url || "",
        source_name: recipe.source_name || "",
        thumbnail: recipe.thumbnail || TINY_PLACEHOLDER_IMAGE,
        description: "",
        user_id: userId,
        created_at: recipe.created_at,
    })

    if (!savedRecipe.success) {
        throw new Error(savedRecipe.error)
    }

    return savedRecipe.data
}
