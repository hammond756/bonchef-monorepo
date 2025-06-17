"use server"

import { v4 as uuidv4 } from "uuid"
import { GeneratedRecipe } from "@/lib/types"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { formatRecipe, getRecipeContent } from "@/lib/services/web-service"
import { RecipeService } from "@/lib/services/recipe-service"
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service"
import { getHostnameFromUrl, hostedImageToBuffer } from "@/lib/utils"
import { withTempFileFromUrl } from "@/lib/temp-file-utils"
import { detectText } from "@/lib/services/google-vision-ai-service"
import { StorageService } from "@/lib/services/storage-service"
import { unitTranslations } from "@/lib/translations"

type GeneratedRecipeWithSource = GeneratedRecipe & {
    source_name?: string | null
    source_url?: string | null
}

function translateRecipeUnits<T extends GeneratedRecipe>(recipe: T): T {
    return {
        ...recipe,
        ingredients: recipe.ingredients.map((group) => ({
            ...group,
            ingredients: group.ingredients.map((ingredient) => {
                const lowerCaseUnit = ingredient.unit.toLowerCase()
                const translatedUnit = unitTranslations[lowerCaseUnit]
                return {
                    ...ingredient,
                    unit: translatedUnit || ingredient.unit,
                }
            }),
        })),
    }
}

export async function scrapeRecipe(
    url: string
): Promise<GeneratedRecipeWithSource & { thumbnail: string }> {
    const recipeData = await getRecipeContent(url)
    const recipeInfo = await formatRecipe(recipeData)
    const { data, contentType, extension } = await hostedImageToBuffer(recipeInfo.thumbnailUrl)
    const thumbnail = await uploadImage(
        new File([data], `scraped-thumbnail.${extension}`, { type: contentType })
    )

    const sourceName = recipeInfo.recipe.source_name || getHostnameFromUrl(url)
    const translatedRecipe = translateRecipeUnits(recipeInfo.recipe)

    return {
        ...translatedRecipe,
        source_name: sourceName,
        source_url: url,
        thumbnail: thumbnail,
    }
}

export async function generateRecipeFromSnippet(
    text: string
): Promise<GeneratedRecipe & { thumbnail: string }> {
    const recipeGenerationService = new RecipeGenerationService()

    const [recipe, thumbnail] = await Promise.all([
        recipeGenerationService.generateBlocking(text, null),
        recipeGenerationService.generateThumbnail(text),
    ] as [Promise<GeneratedRecipe>, Promise<string>])
    const translatedRecipe = translateRecipeUnits(recipe)
    return {
        ...translatedRecipe,
        thumbnail: thumbnail,
    }
}

export async function generateRecipeFromImage(
    imageUrl: string
): Promise<GeneratedRecipe & { thumbnail: string }> {
    const text = await extractTextFromImage(imageUrl)
    const recipeInfo = await formatRecipe(text)
    const translatedRecipe = translateRecipeUnits(recipeInfo.recipe)
    return {
        ...translatedRecipe,
        thumbnail: imageUrl,
    }
}

export async function getSignedUploadUrl(
    filePath: string
): Promise<{ signedUrl: string; path: string; token: string }> {
    const supabaseAdmin = await createAdminClient()
    const storageService = new StorageService(supabaseAdmin)
    const { signedUrl, path, token } = await storageService.getSignedUploadUrl(
        "recipe-images",
        filePath
    )
    return { signedUrl, path, token }
}

export async function uploadImage(file: File): Promise<string> {
    const supabaseAdmin = await createAdminClient()
    const { data, error } = await supabaseAdmin.storage
        .from("recipe-images")
        .upload(`${uuidv4()}.${file.name.split(".").pop()}`, file, {
            contentType: file.type,
            upsert: false,
        })

    if (error) {
        throw new Error(error.message)
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
        .from("recipe-images")
        .createSignedUrl(data.path, 3600)

    if (signedUrlError) {
        console.log("signedUrlError", signedUrlError)
        throw new Error(signedUrlError.message)
    }

    return signedUrlData.signedUrl
}

export async function extractTextFromImage(imageUrl: string): Promise<string> {
    return await withTempFileFromUrl(imageUrl, async (tempFilePath) => {
        return await detectText(tempFilePath)
    })
}

export async function createDraftRecipe(
    recipe: GeneratedRecipeWithSource & { thumbnail: string },
    { isPublic = false }: { isPublic?: boolean } = {}
): Promise<{ id: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let userId = user?.id

    if (!userId) {
        userId = process.env.NEXT_PUBLIC_MARKETING_USER_ID
        if (!userId) {
            throw new Error("Marketing user ID not configured")
        }
    }

    // Use the admin client to allow creating a recipe for another user
    const supabaseAdmin = await createAdminClient()
    const recipeService = new RecipeService(supabaseAdmin)

    const savedRecipe = await recipeService.createRecipe({
        ...recipe,
        is_public: isPublic,
        source_url: recipe.source_url || "https://app.bonchef.io",
        source_name: recipe.source_name || "BonChef",
        thumbnail: recipe.thumbnail,
        description: "",
        user_id: userId,
    })

    if (!savedRecipe.success) {
        throw new Error(savedRecipe.error)
    }

    return savedRecipe.data
}
