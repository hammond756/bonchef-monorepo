import { GeneratedRecipe } from "@/lib/types"
import { SSEWriter } from "@/lib/sse-writer"
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service"

export async function POST(req: Request) {
    try {
        const { text, image } = await req.json()

        if (!text) {
            return new Response("No teaser content provided", {
                status: 400,
                headers: {
                    "Content-Type": "text/event-stream",
                },
            })
        }

        const recipeGenerationService = new RecipeGenerationService()
        const stream = await recipeGenerationService.generateStreaming(text, image || "")

        // Create SSE writer and process the stream
        const writer = new SSEWriter()
        writer.writeStream<GeneratedRecipe>(stream)

        return new Response(writer.getStream(), {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        })
    } catch (error) {
        console.error("Error generating recipe:", error)
        return new Response("Error generating recipe", {
            status: 500,
            headers: {
                "Content-Type": "text/event-stream",
            },
        })
    }
}
