import { NextResponse } from "next/server"
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service"
import { GeneratedRecipeSchema } from "@/lib/types"

export async function POST(request: Request) {
    try {
        const { recipe, prompt_variables } = await request.json()
        delete recipe.thumbnail

        // Only keep fields defined in the schema, protects profile
        // data and limits the impot tokens we use.
        const parsedRecipe = GeneratedRecipeSchema.parse(recipe)

        console.log("prompt_variables", prompt_variables)

        const recipeGenerationService = new RecipeGenerationService()
        const data = await recipeGenerationService.generateThumbnail(
            JSON.stringify(parsedRecipe),
            prompt_variables
        )

        return NextResponse.json({ image: data })
    } catch (error) {
        console.error("Error generating image:", error)
        return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
    }
}
