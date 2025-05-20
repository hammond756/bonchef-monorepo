import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadImageFromBase64Server, imageUrlToBase64Server } from "@/utils/supabase/storage-server";
import { RecipeService } from "@/lib/services/recipe-service";

// Helper function to check if string is a valid URL
function isValidUrl(urlString: string) {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// Helper function to process the thumbnail
async function processThumbnail(thumbnail: string): Promise<{ success: true, data: string } | { success: false, error: string }> {
  try {
    // If it's already a Supabase Storage URL, return it as is
    if (thumbnail.includes(process.env.NEXT_PUBLIC_SUPABASE_URL as string) &&
      thumbnail.includes('/storage/v1/object/public/')) {
      return { success: true, data: thumbnail };
    }

    // If it's a URL but not a base64 string, fetch it and convert to base64 first
    if (isValidUrl(thumbnail) && !thumbnail.startsWith("data:")) {
      thumbnail = await imageUrlToBase64Server(thumbnail);
    }

    // If it's a base64 string, upload to Supabase Storage
    if (thumbnail.startsWith("data:")) {
      const url = await uploadImageFromBase64Server(thumbnail);
      return { success: true, data: url };
    }

    // If it doesn't match any known format, return as is
    return { success: true, data: thumbnail };
  } catch (error) {
    console.error("Error processing thumbnail:", error);
    return { success: false, error: "Failed to process thumbnail image" };
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 401 }
    );
  }
  
  const recipeService = new RecipeService(supabase)
  const data = await request.json();
  const { id, ...recipeData } = data;

  // Process thumbnail to store in Supabase Storage instead of as base64
  if (recipeData.thumbnail) {
    const thumbnailResult = await processThumbnail(recipeData.thumbnail);
    if (!thumbnailResult.success) {
      return NextResponse.json(
        { error: thumbnailResult.error },
        { status: 500 }
      );
    }

    recipeData.thumbnail = thumbnailResult.data;
  }

  if (id) {
    const response = await recipeService.updateRecipe(id, recipeData)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    // Revalidate the recipe page
    revalidatePath(`/recipes/${id}`)

    // Revalidate paths when recipe is updated
    if (response.data.is_public) {

      // Revalidate the discover page
      revalidatePath("/ontdek")
    }

    return NextResponse.json({ recipe: response.data });
  } else {
    const response = await recipeService.createRecipe({...recipeData, user_id: user.id})

    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    revalidatePath(`/recipes/${response.data.id}`)

    // Revalidate paths when new recipe is created
    if (response.data.is_public) {

      // Revalidate the discover page
      revalidatePath("/ontdek")
    }

    return NextResponse.json(
      { message: "Recipe saved successfully", recipe: response.data },
      { status: 200 }
    );
  }
} 