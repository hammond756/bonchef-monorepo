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
    const messages: Record<string, Record<string, string>> = {
        no_food: {
            image: "Deze afbeelding lijkt geen recept te bevatten",
            url: "Deze pagina lijkt geen recept te bevatten",
            text: "Deze tekst lijkt geen recept te bevatten",
            vertical_video: "Deze video lijkt geen recept te bevatten",
            dishcovery: "Deze afbeelding lijkt geen eten te bevatten",
        },
        no_context: {
            image: "We konden niet genoeg informatie uit de afbeelding halen om een recept te maken",
            url: "We konden niet genoeg informatie vinden om een goed recept te maken",
            text: "Het lijkt erop dat er beperkte context beschikbaar is - recept wordt gegenereerd met beschikbare informatie",
            vertical_video: "We konden niet genoeg informatie vinden om een goed recept te maken",
            dishcovery: "De input bevat niet genoeg informatie om een recept te maken",
        },
    }

    if (metadata.containsFood && !metadata.enoughContext && sourceType === "text") {
        return {
            isError: false,
            message: messages["no_context"]["text"],
        }
    }

    let messageType: "no_food" | "no_context"

    if (!metadata.containsFood) {
        messageType = "no_food"
    } else if (!metadata.enoughContext) {
        messageType = "no_context"
    } else {
        return { isError: false }
    }

    return {
        isError: !(metadata.containsFood && metadata.enoughContext),
        message: messages[messageType][sourceType],
    }
}
