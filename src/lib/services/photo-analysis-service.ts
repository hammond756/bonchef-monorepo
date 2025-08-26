import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { hostedImageToBase64 } from "@/lib/utils"

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

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key not configured")
        }

        this.openai = new ChatOpenAI({
            modelName: "gpt-4o",
            openAIApiKey: process.env.OPENAI_API_KEY,
            maxTokens: 1000,
        })
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

            // Create the system prompt for visual analysis
            const systemPrompt =
                new SystemMessage(`You are a culinary expert specializing in visual analysis of food dishes. Your task is to analyze photos of dishes and provide practical observations about what you can see.

ANALYSIS REQUIREMENTS:
- Focus ONLY on what you can VISUALLY see in the image
- Do NOT make assumptions about taste, smell, or cooking methods you can't see
- Be practical and concise in your observations
- Identify the dish type and main ingredients
- Note any obvious cooking methods you can see

WHAT TO ANALYZE:
1. What type of dish this appears to be
2. The main ingredients you can clearly see
3. Any obvious cooking methods (grilled, fried, raw, etc.) if visible
4. A brief visual description of what you observe

RESPONSE FORMAT:
Return a JSON object with the following structure:
{
  "dishType": "what type of dish this appears to be",
  "visibleIngredients": ["main ingredient 1", "main ingredient 2", ...],
  "cookingMethods": ["cooking method 1", "cooking method 2", ...] (only if clearly visible),
  "visualDescription": "brief description of what you see in the image"
}`)

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
