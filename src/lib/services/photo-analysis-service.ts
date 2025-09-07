import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { hostedImageToBase64 } from "@/lib/utils"
import Langfuse from "langfuse"
import { z } from "zod"

// Zod schema for photo analysis result
export const PhotoAnalysisResultSchema = z.object({
    dishType: z.string().describe("The type of dish visible in the photo"),
    visibleIngredients: z
        .array(z.string())
        .describe("List of ingredients that can be clearly seen in the photo"),
    cookingMethods: z
        .array(z.string())
        .describe("Cooking methods that appear to have been used based on visual cues"),
    visualDescription: z.string().describe("Detailed description of what is visible in the photo"),
})

export type PhotoAnalysisResult = z.infer<typeof PhotoAnalysisResultSchema>

type ServiceResponse<T> = Promise<
    | {
          success: false
          error: string
      }
    | {
          success: true
          data: T
      }
>

/**
 * A service for analyzing photos of dishes using OpenAI's GPT-4 Vision API.
 * This service focuses purely on visual analysis without generating recipes.
 */
export class PhotoAnalysisService {
    private openai: ReturnType<typeof ChatOpenAI.prototype.withStructuredOutput>
    private langfuse: Langfuse

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key not configured")
        }

        this.openai = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.1,
            maxTokens: 4096,
        }).withStructuredOutput(PhotoAnalysisResultSchema)
        this.langfuse = new Langfuse()
    }

    /**
     * Analyzes a photo of a dish and returns detailed visual analysis.
     * @param photoUrl - The URL of the photo to analyze
     * @returns Promise<ServiceResponse<PhotoAnalysisResult>> - The visual analysis result
     */
    async analyzePhoto(photoUrl: string): Promise<ServiceResponse<PhotoAnalysisResult>> {
        try {
            console.log("[PhotoAnalysisService] Starting photo analysis...")

            // Convert hosted image to base64
            const base64Image = await hostedImageToBase64(photoUrl)

            // Get the system prompt from Langfuse
            const promptClient = await this.langfuse.getPrompt("AnalyzeDishPhoto", undefined, {
                type: "text",
            })
            const systemPrompt = new SystemMessage(await promptClient.compile())

            // Create the human message with the image
            const humanMessage = new HumanMessage({
                content: [
                    {
                        type: "text",
                        text: "Please analyze this photo of a dish and provide detailed visual observations. Focus on what you can actually see in the image.",
                    },
                    {
                        type: "image_url",
                        image_url: { url: base64Image, detail: "high" },
                    },
                ],
            })

            // Get the structured analysis from OpenAI
            const analysisResult = await this.openai.invoke([systemPrompt, humanMessage])
            console.log("[PhotoAnalysisService] Raw analysis result:", analysisResult)
            console.log("[PhotoAnalysisService] Analysis result type:", typeof analysisResult)
            console.log("[PhotoAnalysisService] Analysis result keys:", Object.keys(analysisResult))

            // Cast to the expected type since structured output guarantees the format
            const typedResult = analysisResult as PhotoAnalysisResult
            console.log("[PhotoAnalysisService] Typed result:", typedResult)

            console.log("[PhotoAnalysisService] Photo analysis complete")
            return { success: true, data: typedResult }
        } catch (error) {
            console.error("[PhotoAnalysisService] Photo analysis failed:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            return { success: false, error: `Photo analysis failed: ${errorMessage}` }
        }
    }
}
