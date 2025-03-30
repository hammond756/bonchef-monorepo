import { createRecipeModel, createTestRecipeModel } from "@/lib/model-factory"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { NextResponse } from "next/server"
import { RecipeCacheCallbackHandler } from "@/lib/callbacks/recipe-cache-callback"
import { recipeCache } from "@/lib/stores/recipe-cache"
import { computeMD5 } from "@/lib/utils"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { GeneratedRecipe, Recipe } from "@/lib/types"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"
import Langfuse from "langfuse"

const langfuse = new Langfuse()

async function generateRecipe(teaserContent: string) {
  // Compute MD5 hash of the teaser content to use as cache key
  const cacheKey = computeMD5(teaserContent)
  
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

  const userInput = new HumanMessage(teaserContent)

  const stream = await recipeModel.streamEvents([prompt, userInput], {
    version: "v2",
    encoding: "text/event-stream",
    callbacks: [cacheCallback],
  })
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}

export async function POST(req: Request) {
  try {
    const { teaserContent } = await req.json()
    
    if (!teaserContent) {
      return new Response("No teaser content provided", {
        status: 400,
        headers: {
          "Content-Type": "text/event-stream",
        },
      })
    }

    return generateRecipe(teaserContent)
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

