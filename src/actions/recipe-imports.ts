"use server"

import { v4 as uuidv4 } from "uuid"
import { GeneratedRecipe } from "@/lib/types"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { formatRecipe, getRecipeContent, normalizeUrl } from "@/lib/services/web-service"
import { RecipeService } from "@/lib/services/recipe-service"
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service"
import { getHostnameFromUrl, hostedImageToBuffer } from "@/lib/utils"
import { withTempFileFromUrl } from "@/lib/temp-file-utils"
import { detectText } from "@/lib/services/google-vision-ai-service"
import { StorageService } from "@/lib/services/storage-service"
import { unitTranslations } from "@/lib/translations"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { OnboardingService } from "@/lib/services/onboarding-service"
import { createJobWithClient } from "@/lib/services/recipe-imports-job/shared"

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
    console.log(`[scrapeRecipe] Starting scraping for ${url}`)
    const normalizedUrl = normalizeUrl(url)
    const { textForLLM, bestImageUrl } = await getRecipeContent(normalizedUrl)

    console.log(
        `[scrapeRecipe] Scraped content length: ${textForLLM.length} characters. Found image URL: ${bestImageUrl}. Now formatting with AI...`
    )
    const recipeInfo = await formatRecipe(textForLLM)
    console.log("[scrapeRecipe] AI formatting complete. Processing thumbnail...")

    const finalThumbnailUrl = bestImageUrl || recipeInfo.thumbnailUrl

    if (!finalThumbnailUrl) {
        console.warn("[scrapeRecipe] No thumbnail URL found from any source. Using placeholder.")
        const placeholderPath = path.join(process.cwd(), "public", "no-image_placeholder.png")
        const placeholderBuffer = await fs.promises.readFile(placeholderPath)
        const placeholderFile = new File([placeholderBuffer], "no-image_placeholder.png", {
            type: "image/png",
        })
        const thumbnailUrl = await uploadImage(placeholderFile)
        return {
            ...recipeInfo.recipe,
            thumbnail: thumbnailUrl,
        }
    }

    let { data, contentType, extension } = await hostedImageToBuffer(finalThumbnailUrl)

    // Convert webp to jpeg before uploading
    if (contentType === "image/webp") {
        data = await sharp(data).jpeg().toBuffer()
        contentType = "image/jpeg"
        extension = "jpg"
    } else if (contentType === "image/svg+xml") {
        // Convert svg to png before uploading
        data = await sharp(data).png().toBuffer()
        contentType = "image/png"
        extension = "png"
    }

    const thumbnail = await uploadImage(
        new File([data], `scraped-thumbnail.${extension}`, { type: contentType })
    )

    const sourceName = recipeInfo.recipe.source_name || getHostnameFromUrl(normalizedUrl)
    const translatedRecipe = translateRecipeUnits(recipeInfo.recipe)

    return {
        ...translatedRecipe,
        source_name: sourceName,
        source_url: normalizedUrl,
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

    const uploadOptions: { contentType: string; upsert: boolean } = {
        contentType: file.type,
        upsert: false,
    }

    // If the content type is webp, try to upload it as jpeg, as many clients can handle it.
    if (file.type === "image/webp") {
        uploadOptions.contentType = "image/jpeg"
    }

    const { data, error } = await supabaseAdmin.storage
        .from("recipe-images")
        .upload(`${uuidv4()}.${file.name.split(".").pop()}`, file, uploadOptions)

    if (error) {
        throw new Error(error.message)
    }

    const { data: publicUrlData } = supabaseAdmin.storage
        .from("recipe-images")
        .getPublicUrl(data.path)

    if (!publicUrlData) {
        throw new Error("Could not get public URL for uploaded image.")
    }

    return publicUrlData.publicUrl
}

export async function extractTextFromImage(imageUrl: string): Promise<string> {
    return await withTempFileFromUrl(imageUrl, async (tempFilePath) => {
        return await detectText(tempFilePath)
    })
}

export async function createDraftRecipe(
    recipe: GeneratedRecipeWithSource & { thumbnail: string; created_at?: string },
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
        status: "DRAFT",
        is_public: isPublic,
        source_url: recipe.source_url || "https://app.bonchef.io",
        source_name: recipe.source_name || "BonChef",
        thumbnail: recipe.thumbnail,
        description: "",
        user_id: userId,
        created_at: recipe.created_at,
    })

    if (!savedRecipe.success) {
        throw new Error(savedRecipe.error)
    }

    return savedRecipe.data
}

async function _processJobInBackground(
    job: {
        id: string
        source_type: string
        source_data: string
        created_at: string
    },
    onboardingSessionId?: string
) {
    try {
        let recipe: GeneratedRecipeWithSource & { thumbnail: string }

        switch (job.source_type) {
            case "url":
                recipe = await scrapeRecipe(job.source_data)
                break
            case "image":
                recipe = await generateRecipeFromImage(job.source_data)
                break
            case "text":
                recipe = await generateRecipeFromSnippet(job.source_data)
                break
            default:
                throw new Error(`Unsupported source type: ${job.source_type}`)
        }

        const savedRecipe = await createDraftRecipe({
            ...recipe,
            created_at: job.created_at,
        })

        const supabaseAdmin = await createAdminClient()

        if (onboardingSessionId) {
            const onboardingService = new OnboardingService(supabaseAdmin)
            await onboardingService.createRecipeAssociation(onboardingSessionId, savedRecipe.id)
        }

        const { error: updateError } = await supabaseAdmin
            .from("recipe_import_jobs")
            .update({
                status: "completed",
                recipe_id: savedRecipe.id,
            })
            .eq("id", job.id)

        if (updateError) {
            console.error(
                `CRITICAL: Job ${job.id} succeeded but failed to update status to 'completed'. Error: ${updateError.message}`
            )
        } else {
            console.log(
                `Job ${job.id} succeeded. Draft created with id ${savedRecipe.id} and job marked as completed.`
            )
        }
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error"
        const supabaseAdmin = await createAdminClient()
        const { error: updateError } = await supabaseAdmin
            .from("recipe_import_jobs")
            .update({
                status: "failed",
                error_message: errorMessage,
            })
            .eq("id", job.id)

        if (updateError) {
            console.error(
                `CRITICAL: Job ${job.id} failed but ALSO failed to update its status. Original Error: ${errorMessage}. Update Error: ${updateError.message}`
            )
        } else {
            console.error(
                `Job ${job.id} failed and status marked as failed. Error: ${errorMessage}`
            )
        }
    }
}

export async function startRecipeImportJob(
    sourceType: "url" | "image" | "text",
    sourceData: string,
    onboardingSessionId?: string
) {
    const supabaseAuthClient = await createClient()
    const supabaseAdminClient = await createAdminClient()

    const {
        data: { user },
    } = await supabaseAuthClient.auth.getUser()

    if (!user && !onboardingSessionId) {
        throw new Error("User must be logged in to import recipes.")
    }

    const userId = user?.id || process.env.NEXT_PUBLIC_MARKETING_USER_ID

    if (!userId) {
        throw new Error("Could not determine user ID for import job.")
    }

    const jobResponse = await createJobWithClient(
        supabaseAdminClient,
        sourceType,
        sourceData,
        userId
    )

    if (!jobResponse.success) {
        throw new Error(jobResponse.error)
    }
    const job = jobResponse.data

    if (onboardingSessionId) {
        const onboardingService = new OnboardingService(supabaseAdminClient)
        const associationResponse = await onboardingService.createJobAssociation(
            onboardingSessionId,
            job.id
        )

        if (!associationResponse.success) {
            // If this fails, we should ideally roll back the job creation,
            // but for now, we'll log the error and continue.
            console.error(
                `Failed to associate job ${job.id} with onboarding session ${onboardingSessionId}:`,
                associationResponse.error
            )

            throw new Error("Failed to associate job with onboarding session")
        }
    }

    // Don't await this, let it run in the background
    void _processJobInBackground(
        {
            id: job.id,
            source_type: sourceType,
            source_data: sourceData,
            created_at: new Date().toISOString(),
        },
        onboardingSessionId
    )
}
