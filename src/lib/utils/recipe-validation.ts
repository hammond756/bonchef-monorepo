import { RecipeGenerationMetadata } from "../services/web-service"

/**
 * Validates recipe content based on quality checks from Langfuse prompts
 * @param recipe The generated recipe with quality validation fields
 * @param sourceType The type of source (url, image, text)
 * @returns Validation result with error or warning information
 */
export function validateRecipeContent(
    metadata: RecipeGenerationMetadata,
    sourceType: string
): { isError: boolean; message?: string; warning?: string } {
    // Only validate if the recipe has the new quality validation fields
    // This prevents validation errors on existing recipes that don't have these fields
    if (metadata.containsFood === undefined || metadata.enoughContext === undefined) {
        return { isError: false } // Skip validation for existing recipes
    }

    // Strict validation for images
    if (sourceType === "image") {
        if (!metadata.containsFood) {
            return {
                isError: true,
                message: "Deze afbeelding lijkt geen recept te bevatten",
            }
        }
        if (!metadata.enoughContext) {
            return {
                isError: true,
                message:
                    "We konden niet genoeg informatie uit de afbeelding halen om een recept te maken",
            }
        }
    }

    // Strict validation for URLs (same as images)
    if (sourceType === "url") {
        if (!metadata.containsFood) {
            return {
                isError: true,
                message: "Deze pagina lijkt geen recept te bevatten",
            }
        }
        if (!metadata.enoughContext) {
            return {
                isError: true,
                message: "We konden niet genoeg informatie vinden om een goed recept te maken",
            }
        }
    }

    // Flexible validation only for text snippets
    if (sourceType === "text") {
        if (!metadata.containsFood) {
            return {
                isError: true,
                message: "Deze tekst lijkt geen recept te bevatten",
            }
        }

        // For text snippets, enoughContext: false is allowed to continue
        // but we log a warning
        if (!metadata.enoughContext) {
            return {
                isError: false,
                warning:
                    "Het lijkt erop dat er beperkte context beschikbaar is - recept wordt gegenereerd met beschikbare informatie",
            }
        }
    }

    return { isError: false } // Validation passed
}
