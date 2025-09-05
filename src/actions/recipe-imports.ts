"use server"

import { v4 as uuidv4 } from "uuid"
import { GeneratedRecipe } from "@/lib/types"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import {
    formatRecipe,
    getRecipeContent,
    GeneratedRecipeWithSourceAndThumbnail,
    normalizeUrl,
    RecipeGenerationMetadata,
    recipeFromSocialMediaVideo,
} from "@/lib/services/web-service"
import { RecipeService } from "@/lib/services/recipe-service"
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service"
import { getHostnameFromUrl, hostedImageToBuffer } from "@/lib/utils"
import { validateRecipeContent } from "@/lib/utils/recipe-validation"
import { withTempFileFromUrl } from "@/lib/temp-file-utils"
import { detectText } from "@/lib/services/google-vision-ai-service"
import { StorageService } from "@/lib/services/storage-service"
import { unitTranslations } from "@/lib/translations"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { OnboardingService } from "@/lib/services/onboarding-service"
import { createJobWithClient } from "@/lib/services/recipe-imports-job/shared"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"

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

async function uploadExternalImage(url: string): Promise<string> {
    let { data, contentType, extension } = await hostedImageToBuffer(url)

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

    return uploadImage(new File([data], `scraped-thumbnail.${extension}`, { type: contentType }))
}

export async function scrapeRecipe(
    url: string
): Promise<{ recipe: GeneratedRecipeWithSourceAndThumbnail; metadata: RecipeGenerationMetadata }> {
    console.log(`[scrapeRecipe] Starting scraping for ${url}`)
    const normalizedUrl = normalizeUrl(url)
    const { textForLLM, bestImageUrl } = await getRecipeContent(normalizedUrl)

    console.log(
        `[scrapeRecipe] Scraped content length: ${textForLLM.length} characters. Found image URL: ${bestImageUrl}. Now formatting with AI...`
    )
    const recipeInfo = await formatRecipe(textForLLM)
    console.log("[scrapeRecipe] AI formatting complete. Processing thumbnail...")

    const finalThumbnailUrl = bestImageUrl || recipeInfo.recipe.thumbnail

    if (!finalThumbnailUrl) {
        console.warn("[scrapeRecipe] No thumbnail URL found from any source. Using placeholder.")
        const placeholderPath = path.join(process.cwd(), "public", "no-image_placeholder.png")
        const placeholderBuffer = await fs.promises.readFile(placeholderPath)
        const placeholderFile = new File([placeholderBuffer], "no-image_placeholder.png", {
            type: "image/png",
        })
        const thumbnailUrl = await uploadImage(placeholderFile)
        return {
            recipe: {
                ...recipeInfo.recipe,
                thumbnail: thumbnailUrl,
            },
            metadata: recipeInfo.metadata,
        }
    }

    const thumbnail = await uploadExternalImage(finalThumbnailUrl)
    const sourceName = recipeInfo.recipe.source_name || getHostnameFromUrl(normalizedUrl)
    const translatedRecipe = translateRecipeUnits(recipeInfo.recipe)

    return {
        recipe: {
            ...translatedRecipe,
            thumbnail: thumbnail,
            source_name: sourceName,
            source_url: normalizedUrl,
        },
        metadata: recipeInfo.metadata,
    }
}

export async function generateRecipeFromSnippet(
    text: string
): Promise<{ recipe: GeneratedRecipeWithSourceAndThumbnail; metadata: RecipeGenerationMetadata }> {
    const recipeGenerationService = new RecipeGenerationService()

    const [{ recipe, metadata }, thumbnail] = await Promise.all([
        formatRecipe(text),
        recipeGenerationService.generateThumbnail(text),
    ] as [
        Promise<{ recipe: GeneratedRecipe; metadata: RecipeGenerationMetadata }>,
        Promise<string>,
    ])
    const translatedRecipe = translateRecipeUnits(recipe)
    return {
        recipe: {
            ...translatedRecipe,
            thumbnail: thumbnail,
            source_name: "",
            source_url: "",
        },
        metadata,
    }
}

export async function generateRecipeFromImage(
    imageUrl: string
): Promise<{ recipe: GeneratedRecipeWithSourceAndThumbnail; metadata: RecipeGenerationMetadata }> {
    const text = await extractTextFromImage(imageUrl)
    const recipeInfo = await formatRecipe(text)
    const translatedRecipe = translateRecipeUnits(recipeInfo.recipe)
    return {
        recipe: {
            ...translatedRecipe,
            thumbnail: imageUrl,
            source_name: "",
            source_url: "",
        },
        metadata: recipeInfo.metadata,
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
    recipe: GeneratedRecipeWithSourceAndThumbnail & { created_at?: string },
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

import { ApifyService, ScrapeResult } from "@/lib/services/apify-service"
import { processVideoUrl } from "@/lib/services/video-processing-service/server"

async function handleVerticalVideoImport(
    sourceData: string
): Promise<{ recipe: GeneratedRecipeWithSourceAndThumbnail; metadata: RecipeGenerationMetadata }> {
    const apifyService = new ApifyService({
        apiToken: process.env.APIFY_API_KEY!,
    })

    let scrapeResult: { success: true; data: ScrapeResult } | { success: false; error: string } = {
        success: false,
        error: "No scrape result",
    }

    if (sourceData.includes("instagram.com")) {
        scrapeResult = await apifyService.scrapeInstagramReel(sourceData)
    } else if (sourceData.includes("tiktok.com")) {
        scrapeResult = await apifyService.scrapeTikTok(sourceData)
    }

    if (!scrapeResult.success) {
        throw new Error(scrapeResult.error)
    }

    const thumbnail = await uploadExternalImage(scrapeResult.data.thumbnailUrl)
    const { recipe: captionRecipe, metadata: captionMetadata } = await formatRecipe(
        scrapeResult.data.caption
    )

    if (captionMetadata.enoughContext && captionMetadata.containsFood) {
        return {
            recipe: {
                ...captionRecipe,
                thumbnail,
                source_name: scrapeResult.data.author,
                source_url: sourceData,
            },
            metadata: captionMetadata,
        }
    }

    // Process video through external service to get collage and transcript
    const videoSummaryResult = await processVideoUrl(scrapeResult.data.videoUrl)

    if (!videoSummaryResult.success) {
        throw new Error(videoSummaryResult.error)
    }

    const videoSummary = videoSummaryResult.data
    const combinedText = `${scrapeResult.data.caption}\n\n${videoSummary.transcript}`

    const { recipe: transcriptionRecipe, metadata: transcriptionMetadata } =
        await recipeFromSocialMediaVideo(combinedText, videoSummary.collage_url)

    const translatedRecipe = translateRecipeUnits(transcriptionRecipe)

    return {
        recipe: {
            ...translatedRecipe,
            thumbnail,
            source_name: scrapeResult.data.author,
            source_url: sourceData,
        },
        metadata: transcriptionMetadata,
    }
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
        let recipe: GeneratedRecipeWithSourceAndThumbnail
        let metadata: RecipeGenerationMetadata

        switch (job.source_type) {
            case "url":
                ;({ recipe, metadata } = await scrapeRecipe(job.source_data))
                break
            case "image":
                ;({ recipe, metadata } = await generateRecipeFromImage(job.source_data))
                break
            case "text":
                ;({ recipe, metadata } = await generateRecipeFromSnippet(job.source_data))
                break
            case "vertical_video":
                ;({ recipe, metadata } = await handleVerticalVideoImport(job.source_data))
                break
            default:
                throw new Error(`Unsupported source type: ${job.source_type}`)
        }

        // Smart validation based on content quality checks
        const validationResult = validateRecipeContent(metadata, job.source_type)
        if (validationResult.isError) {
            throw new Error(validationResult.message)
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

        // Determine if this is a content quality error (user-friendly) or technical error
        const isContentQualityError = [
            "Het lijkt erop dat deze afbeelding niet over eten ging",
            "We konden niet genoeg informatie uit de afbeelding halen om een recept te maken",
            "Deze tekst leek niet over eten te gaan",
            "We konden niet genoeg informatie vinden om een goed recept te maken",
        ].some((msg) => errorMessage.includes(msg))

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
            if (isContentQualityError) {
                console.log(`Job ${job.id} failed due to content quality issues: ${errorMessage}`)
            } else {
                console.error(`Job ${job.id} failed due to technical issues: ${errorMessage}`)
            }
        }
    }
}

export async function startRecipeImportJob(
    sourceType: "url" | "image" | "text" | "vertical_video",
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

    return job.id
}
