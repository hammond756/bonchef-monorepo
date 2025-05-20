"use server"

import { v4 as uuidv4 } from "uuid";
import { GeneratedRecipe, RecipeRead } from "@/lib/types";
import { createAdminClient } from "@/utils/supabase/server";
import { getRecipeContent } from "@/lib/services/web-service";
import { RecipeService } from "@/lib/services/recipe-service";
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service";
import { hostedImageToBuffer } from "@/lib/utils";

export async function scrapeRecipe(url: string): Promise<GeneratedRecipe & { thumbnail: string }> {
  const recipeInfo = await getRecipeContent(url)
  const { data, contentType, extension } = await hostedImageToBuffer(recipeInfo.thumbnailUrl)
  const thumbnail = await uploadImage(new File([data], `scraped-thumbnail.${extension}`, { type: contentType }))
  return {
    ...recipeInfo.recipe,
    thumbnail: thumbnail
  }
}

export async function generateRecipeFromImageUpload(text: string, imageUrl: string): Promise<GeneratedRecipe> {
  const recipeGenerationService = new RecipeGenerationService()
  const recipe = await recipeGenerationService.generateBlocking(text, imageUrl)
  return recipe
}

export async function generateRecipeFromSnippet(text: string): Promise<GeneratedRecipe & { thumbnail: string }> {
  const recipeGenerationService = new RecipeGenerationService()

  const [recipe, thumbnail] = await Promise.all([
    recipeGenerationService.generateBlocking(text, null),
    recipeGenerationService.generateThumbnail(text)
  ] as [Promise<GeneratedRecipe>, Promise<string>])
  return {
    ...recipe,
    thumbnail: thumbnail
  }

}

export async function uploadImage(file: File): Promise<string> {
  const supabaseAdmin = await createAdminClient()
  const { data, error } = await supabaseAdmin.storage
    .from("recipe-images")
    .upload(`${uuidv4()}.${file.name.split(".").pop()}`, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
    .from("recipe-images")
    .createSignedUrl(data.path, 3600)

  if (signedUrlError) {
    console.log("signedUrlError", signedUrlError)
    throw new Error(signedUrlError.message)
  }

  return signedUrlData.signedUrl
}

export async function saveMarketingRecipe(recipe: GeneratedRecipe & { thumbnail: string }): Promise<RecipeRead> {
  const supabaseAdmin = await createAdminClient()
  const recipeService = new RecipeService(supabaseAdmin)

  const savedRecipe = await recipeService.createRecipe({
    ...recipe,
    is_public: true,
    source_url: "https://app.bonchef.io",
    source_name: "BonChef",
    thumbnail: recipe.thumbnail,
    description: "",
    user_id: process.env.NEXT_PUBLIC_MARKETING_USER_ID!,
  })

  if (!savedRecipe.success) {
    throw new Error(savedRecipe.error)
  }

  return savedRecipe.data
}
