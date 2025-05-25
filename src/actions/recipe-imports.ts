"use server"

import { v4 as uuidv4 } from "uuid";
import { GeneratedRecipe, RecipeRead } from "@/lib/types";
import { createAdminClient, createClient } from "@/utils/supabase/server";
import { formatRecipe, getRecipeContent } from "@/lib/services/web-service";
import { RecipeService } from "@/lib/services/recipe-service";
import { RecipeGenerationService } from "@/lib/services/recipe-generation-service";
import { hostedImageToBuffer } from "@/lib/utils";
import { withTempFileFromUrl } from "@/lib/temp-file-utils";
import { detectText } from "@/lib/services/google-vision-ai-service";
import { StorageService } from "@/lib/services/storage-service";

export async function scrapeRecipe(url: string): Promise<GeneratedRecipe & { thumbnail: string }> {
  const recipeData = await getRecipeContent(url)
  const recipeInfo = await formatRecipe(recipeData)
  const { data, contentType, extension } = await hostedImageToBuffer(recipeInfo.thumbnailUrl)
  const thumbnail = await uploadImage(new File([data], `scraped-thumbnail.${extension}`, { type: contentType }))

  return {
    ...recipeInfo.recipe,
    thumbnail: thumbnail
  }
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

export async function generateRecipeFromImage(imageUrl: string): Promise<GeneratedRecipe & { thumbnail: string }> {
  const text = await extractTextFromImage(imageUrl)
  const recipeInfo = await formatRecipe(text)
  return {
    ...recipeInfo.recipe,
    thumbnail: imageUrl
  }
}


export async function getSignedUploadUrl(filePath: string): Promise<{ signedUrl: string, path: string, token: string }> {
  const supabaseAdmin = await createAdminClient()
  const storageService = new StorageService(supabaseAdmin)
  const { signedUrl, path, token } = await storageService.getSignedUploadUrl("recipe-images", filePath)
  return { signedUrl, path, token }
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

export async function extractTextFromImage(imageUrl: string): Promise<string> {
  return await withTempFileFromUrl(imageUrl, async (tempFilePath) => {
    return await detectText(tempFilePath);
  });
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

export async function saveRecipe(recipe: GeneratedRecipe & { thumbnail: string }): Promise<RecipeRead> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not found")
  }

  const recipeService = new RecipeService(supabase)

  const savedRecipe = await recipeService.createRecipe({
    ...recipe,
    is_public: false,
    source_url: "https://app.bonchef.io",
    source_name: "BonChef",
    description: "",
    user_id: user.id,
  })

  if (!savedRecipe.success) {
    throw new Error(savedRecipe.error)
  }

  return savedRecipe.data
}