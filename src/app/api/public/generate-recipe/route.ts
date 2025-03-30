import { createRecipeModel, createTestRecipeModel } from "@/lib/model-factory"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { RecipeCacheCallbackHandler } from "@/lib/callbacks/recipe-cache-callback"
import { recipeCache } from "@/lib/stores/recipe-cache"
import { computeMD5 } from "@/lib/utils"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { GeneratedRecipe, Recipe } from "@/lib/types"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"
import Langfuse from "langfuse"
import { SSEWriter } from "@/lib/sse-writer"

const langfuse = new Langfuse()

async function generateRecipe(text: string, imageUrl: string) {
  // Compute MD5 hash of the teaser content to use as cache key
  const cacheKey = computeMD5(text + imageUrl)
  
  // Check if recipe is in cache
  const cachedRecipe = recipeCache.get(cacheKey)

  let recipeModel: Runnable<BaseLanguageModelInput, GeneratedRecipe, RunnableConfig<Record<string, any>>>
  if (cachedRecipe) {
    console.log("Cached recipe found for key:", cacheKey)
    recipeModel = createTestRecipeModel(cachedRecipe)
  } else {
    recipeModel = createRecipeModel()
  }
  
  // Create and register the cache callback handler
  const cacheCallback = new RecipeCacheCallbackHandler(cacheKey)

  const promptClient = await langfuse.getPrompt("GenerateRecipe", undefined, {type: "text"})
  const prompt = new SystemMessage(await promptClient.compile())

  const content: any[] = [
    {
      type: "text",
      text: text,
    }, 
  ]

  if (imageUrl) {
    content.push({
      type: "image_url",
      image_url: { url: imageUrl },
    })
  }

  const messages = [
    new HumanMessage({
      content: content
    }),
  ]

  const stream = await recipeModel.streamEvents([prompt, ...messages], {
    version: "v2",
    callbacks: [cacheCallback],
  })

  // Create SSE writer and process the stream
  const writer = new SSEWriter()
  await writer.writeStream<GeneratedRecipe>(stream)


  return new Response(writer.getStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}

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

    return generateRecipe(text, image || "")
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

