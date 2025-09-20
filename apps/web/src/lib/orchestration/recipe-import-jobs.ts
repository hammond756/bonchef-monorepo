import { v4 as uuidv4 } from "uuid"
import { GeneratedRecipe } from "@/lib/types"
import { createAdminClient } from "@/utils/supabase/server"
import {
    formatRecipe,
    getRecipeContent,
    GeneratedRecipeWithSourceAndThumbnail,
    normalizeUrl,
    RecipeGenerationMetadata,
    recipeFromSocialMediaVideo,
    formatDishcoveryRecipe,
} from "@/lib/services/web-service"
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service"
import { getHostnameFromUrl } from "@/lib/utils"
import { validateRecipeContent } from "@/lib/utils/recipe-validation"
import { withTempFileFromUrl } from "@/lib/temp-file-utils"
import { detectText } from "@/lib/services/google-vision-ai-service"
import { unitTranslations } from "@/lib/translations"
import {
    PhotoAnalysisService,
    type PhotoAnalysisResult,
} from "@/lib/services/photo-analysis-service"
import { ApifyService, ScrapeResult } from "@/lib/services/apify-service"
import { processVideoUrl } from "@/lib/services/video-processing-service/server"
import { TranscriptionService } from "@/lib/services/transcription-service"
import { NonCompletedRecipeImportJob } from "../services/recipe-imports-job/shared"
import { COLORFUL_PLACEHOLDER_IMAGE } from "@/utils/contants"

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
    const response = await fetch(url)
    const data = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"
    const extension = contentType.split("/")[1] || "jpg"
    return uploadImage(new File([data], `scraped-thumbnail.${extension}`, { type: contentType }))
}

async function scrapeRecipe(
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
        return {
            recipe: {
                ...recipeInfo.recipe,
                thumbnail: COLORFUL_PLACEHOLDER_IMAGE,
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

async function generateRecipeFromSnippet(
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

async function generateRecipeFromImage(
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

async function uploadImage(file: File): Promise<string> {
    const supabaseAdmin = await createAdminClient()

    // Check if file type is supported
    const supportedTypes = ["image/png", "image/jpeg", "image/webp", "image/avif"]
    if (!supportedTypes.includes(file.type)) {
        throw new Error(
            `Dit afbeeldingsformaat wordt niet ondersteund. Ondersteunde formaten: PNG, JPEG, WebP, AVIF. Probeer een screenshot te maken met je telefoon.`
        )
    }

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
        // Provide more specific error messages based on the error type
        if (error.message.includes("Invalid file type")) {
            throw new Error(
                "Dit afbeeldingsformaat wordt niet ondersteund. Probeer een screenshot te maken met je telefoon en probeer het opnieuw!"
            )
        } else if (error.message.includes("File size")) {
            throw new Error(
                "De afbeelding is te groot. Probeer een kleinere afbeelding of maak een screenshot."
            )
        } else {
            throw new Error(`Upload mislukt: ${error.message}`)
        }
    }

    const { data: publicUrlData } = supabaseAdmin.storage
        .from("recipe-images")
        .getPublicUrl(data.path)

    if (!publicUrlData) {
        throw new Error("Kon geen publieke URL genereren voor de afbeelding.")
    }

    return publicUrlData.publicUrl
}

async function extractTextFromImage(imageUrl: string): Promise<string> {
    return await withTempFileFromUrl(imageUrl, async (tempFilePath) => {
        return await detectText(tempFilePath)
    })
}

async function generateRecipeFromDishcovery(
    dishcoveryData: string
): Promise<{ recipe: GeneratedRecipeWithSourceAndThumbnail; metadata: RecipeGenerationMetadata }> {
    console.log(
        `[generateRecipeFromDishcovery] Starting generation for dishcovery data: ${dishcoveryData.substring(0, 100)}...`
    )

    const transcriptionService = new TranscriptionService({
        apiKey: process.env.OPENAI_API_KEY!,
    })

    // Parse the dishcovery data (photo + description or audio)
    const data = JSON.parse(dishcoveryData)
    const { photoUrl, description, audioUrl } = data

    if (!photoUrl) {
        throw new Error("Invalid dishcovery data: missing photoUrl")
    }

    let finalDescription = description

    // Start both tasks in parallel for better performance
    const tasks: Promise<string | PhotoAnalysisResult>[] = []

    // Task 1: Audio transcription (if needed)
    if (audioUrl && (!description || description.trim().length === 0)) {
        console.log("[generateRecipeFromDishcovery] Starting audio transcription in parallel...")
        console.log("[generateRecipeFromDishcovery] Audio URL:", audioUrl)
        const transcriptionTask = (async () => {
            try {
                const transcriptionResult =
                    await transcriptionService.transcribeVideoFromUrl(audioUrl)

                console.log(
                    "[generateRecipeFromDishcovery] Transcription result:",
                    transcriptionResult
                )

                if (!transcriptionResult.success) {
                    throw new Error(transcriptionResult.error)
                }

                console.log(
                    `[generateRecipeFromDishcovery] Transcription complete: "${transcriptionResult.data}"`
                )
                return transcriptionResult.data
            } catch (error) {
                console.error("[generateRecipeFromDishcovery] Transcription failed:", error)
                throw new Error(
                    "Failed to transcribe audio: " +
                        (error instanceof Error ? error.message : "Unknown error")
                )
            }
        })()

        tasks.push(transcriptionTask)
    }

    // Task 2: Photo analysis
    console.log("[generateRecipeFromDishcovery] Starting photo analysis in parallel...")
    const photoAnalysisTask = (async () => {
        try {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error("OpenAI API key not configured")
            }

            const photoAnalysisService = new PhotoAnalysisService()
            const analysisResult = await photoAnalysisService.analyzePhoto(photoUrl)

            if (!analysisResult.success) {
                throw new Error(analysisResult.error)
            }

            console.log("[generateRecipeFromDishcovery] Photo analysis complete")
            return analysisResult.data
        } catch (error) {
            console.error("[generateRecipeFromDishcovery] Photo analysis failed:", error)

            // Provide more specific error messages for OpenAI Vision API errors
            let errorMessage =
                "Failed to analyze photo: " +
                (error instanceof Error ? error.message : "Unknown error")

            if (error instanceof Error) {
                if (error.message.includes("unsupported image")) {
                    errorMessage =
                        "Failed to analyze photo: This image format is not supported by the photo analysis service. Please try taking a screenshot with your phone."
                } else if (error.message.includes("400")) {
                    errorMessage =
                        "Failed to analyze photo: The image could not be processed. Please try a different photo or take a screenshot."
                }
            }

            throw new Error(errorMessage)
        }
    })()

    tasks.push(photoAnalysisTask)

    // Wait for all tasks to complete
    console.log("[generateRecipeFromDishcovery] Waiting for parallel tasks to complete...")
    const results = await Promise.all(tasks)
    console.log("[generateRecipeFromDishcovery] All tasks completed, results:", results)

    // Extract results
    let transcriptionResult: string | undefined
    let photoAnalysisResult: PhotoAnalysisResult

    if (audioUrl && (!description || description.trim().length === 0)) {
        transcriptionResult = results[0] as string
        photoAnalysisResult = results[1] as PhotoAnalysisResult
        console.log(
            "[generateRecipeFromDishcovery] Transcription result extracted:",
            transcriptionResult
        )
    } else {
        photoAnalysisResult = results[0] as PhotoAnalysisResult
        console.log(
            "[generateRecipeFromDishcovery] No transcription, using description:",
            description
        )
    }

    // Set final description
    if (transcriptionResult) {
        finalDescription = transcriptionResult
        console.log(
            "[generateRecipeFromDishcovery] Final description set from transcription:",
            finalDescription
        )
        console.log(
            "[generateRecipeFromDishcovery] Transcription result length:",
            transcriptionResult.length
        )
    } else {
        console.log(
            "[generateRecipeFromDishcovery] Final description from input:",
            finalDescription
        )
        console.log(
            "[generateRecipeFromDishcovery] Input description length:",
            finalDescription?.length || 0
        )
    }

    // Allow dishcovery with only photo if no description is provided
    // The new prompt can handle minimal user input by relying more on visual analysis
    if (!finalDescription || finalDescription.trim().length < 3) {
        console.log(
            "[generateRecipeFromDishcovery] No description provided, will rely on visual analysis only"
        )
        finalDescription = "" // Set to empty string for minimal input scenario
    }

    // Now generate the recipe using the dishcovery-specific prompt
    console.log("[generateRecipeFromDishcovery] Generating recipe with dishcovery prompt...")

    // Create an enhanced prompt using both the photo analysis and user description
    const enhancedPrompt = `PHOTO ANALYSIS RESULTS:
- Dish Type: ${photoAnalysisResult.dishType}
- Visible Ingredients: ${photoAnalysisResult.visibleIngredients.join(", ")}
- Cooking Methods: ${photoAnalysisResult.cookingMethods.join(", ")}
- Visual Description: ${photoAnalysisResult.visualDescription}

USER DESCRIPTION:
${finalDescription}`

    // Use the dishcovery-specific prompt instead of the general formatRecipe
    const { recipe, metadata } = await formatDishcoveryRecipe(enhancedPrompt)
    console.log("[generateRecipeFromDishcovery] Recipe generation complete")

    // The photo is already uploaded to Supabase storage, use it directly as thumbnail
    const thumbnail = photoUrl

    // formatRecipe already handles unit translation, so we don't need to do it again
    return {
        recipe: {
            ...recipe,
            thumbnail: thumbnail,
            source_name: "",
            source_url: "",
        },
        metadata: metadata,
    }
}

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
        console.error(`Failed to scrape vertical video: ${scrapeResult.error}`)
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
                source_url: scrapeResult.data.canonicalUrl,
            },
            metadata: captionMetadata,
        }
    }

    // Process video through external service to get collage and transcript
    const videoSummaryResult = await processVideoUrl(scrapeResult.data.videoUrl)

    if (!videoSummaryResult.success) {
        console.error(`Error summarizing video: ${videoSummaryResult.error}`)
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
            source_url: scrapeResult.data.canonicalUrl,
        },
        metadata: transcriptionMetadata,
    }
}

export async function processJobInBackground(
    job: NonCompletedRecipeImportJob
): Promise<GeneratedRecipeWithSourceAndThumbnail> {
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
        case "dishcovery":
            ;({ recipe, metadata } = await generateRecipeFromDishcovery(job.source_data))
            break
        default:
            throw new Error(`Unsupported source type: ${job.source_type}`)
    }

    // Smart validation based on content quality checks
    const validationResult = validateRecipeContent(metadata, job.source_type)
    if (validationResult.isError) {
        throw new Error(validationResult.message)
    }

    return recipe
}
