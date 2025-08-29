import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { hostedImageToBase64 } from "@/lib/utils"
import Langfuse from "langfuse"

export interface PhotoAnalysisResult {
    dishType: string
    visibleIngredients: string[]
    cookingMethods: string[]
    visualDescription: string
}

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
    private openai: ChatOpenAI
    private langfuse: Langfuse

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key not configured")
        }

        this.openai = new ChatOpenAI({
            modelName: "gpt-5",
            openAIApiKey: process.env.OPENAI_API_KEY,
        })
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

            // Get the analysis from OpenAI
            const response = await this.openai.invoke([systemPrompt, humanMessage])
            const content = response.content

            if (typeof content !== "string") {
                throw new Error("Unexpected response format from OpenAI")
            }

            // Parse the JSON response
            let analysisResult: PhotoAnalysisResult
            try {
                // Extract JSON from the response (it might be wrapped in markdown)
                const jsonMatch = content.match(/\{[\s\S]*\}/)
                if (!jsonMatch) {
                    throw new Error("No JSON found in response")
                }
                analysisResult = JSON.parse(jsonMatch[0])
            } catch (parseError) {
                console.error("Failed to parse OpenAI response:", parseError)
                throw new Error("Failed to parse photo analysis response")
            }

            // Validate the result structure
            if (!this.isValidAnalysisResult(analysisResult)) {
                throw new Error("Invalid analysis result structure")
            }

            console.log("[PhotoAnalysisService] Photo analysis complete")
            return { success: true, data: analysisResult }
        } catch (error) {
            console.error("[PhotoAnalysisService] Photo analysis failed:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            return { success: false, error: `Photo analysis failed: ${errorMessage}` }
        }
    }

    /**
     * Validates that the analysis result has the correct structure.
     * @param result - The result to validate
     * @returns boolean - True if valid, false otherwise
     */
    private isValidAnalysisResult(result: unknown): result is PhotoAnalysisResult {
        return (
            result !== null &&
            result !== undefined &&
            typeof result === "object" &&
            "dishType" in result &&
            "visibleIngredients" in result &&
            "cookingMethods" in result &&
            "visualDescription" in result &&
            typeof (result as Record<string, unknown>).dishType === "string" &&
            Array.isArray((result as Record<string, unknown>).visibleIngredients) &&
            Array.isArray((result as Record<string, unknown>).cookingMethods) &&
            typeof (result as Record<string, unknown>).visualDescription === "string"
        )
    }
}
