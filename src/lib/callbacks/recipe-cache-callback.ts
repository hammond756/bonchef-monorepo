import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { GeneratedRecipe } from "@/lib/types"
import { recipeCache } from "@/lib/stores/recipe-cache"

export class RecipeCacheCallbackHandler extends BaseCallbackHandler {
  name = "RecipeCacheCallbackHandler"

  constructor(private cacheKey: string) {
    super()
  }

  async handleChainEnd(
    outputs: GeneratedRecipe,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    kwargs?: {
      inputs?: Record<string, unknown>
    }
  ) {
    if (parentRunId) {
      return
    }

    // Only cache valid recipes
    if (outputs && outputs.title && outputs.instructions) {
      recipeCache.set(this.cacheKey, outputs)
    }
  }
} 