import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";
import { ZodError } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadImageFromBase64Server, imageUrlToBase64Server } from "@/utils/supabase/storage-server";

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
async function processThumbnail(thumbnail: string): Promise<string> {
  // If it's already a Supabase Storage URL, return it as is
  if (thumbnail.includes(process.env.NEXT_PUBLIC_SUPABASE_URL as string) && 
      thumbnail.includes('/storage/v1/object/public/')) {
    return thumbnail;
  }
  
  // If it's a URL but not a base64 string, fetch it and convert to base64 first
  if (isValidUrl(thumbnail) && !thumbnail.startsWith("data:")) {
    thumbnail = await imageUrlToBase64Server(thumbnail);
  }
  
  // If it's a base64 string, upload to Supabase Storage
  if (thumbnail.startsWith("data:")) {
    return await uploadImageFromBase64Server(thumbnail);
  }
  
  // If it doesn't match any known format, return as is
  return thumbnail;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, is_public, ...recipeData } = data;
    const validatedRecipe = GeneratedRecipeSchema.parse(recipeData);

    // Process thumbnail to store in Supabase Storage instead of as base64
    if (validatedRecipe.thumbnail) {
      try {
        validatedRecipe.thumbnail = await processThumbnail(validatedRecipe.thumbnail);
      } catch (error) {
        console.error("Error processing thumbnail:", error);
        return NextResponse.json(
          { error: "Failed to process thumbnail image" },
          { status: 500 }
        );
      }
    }

    if (id) {
      // Get the existing recipe to check if we need to replace the image
      const { data: existingRecipe } = await supabase
        .from("recipe_creation_prototype")
        .select("user_id, thumbnail, is_public")
        .eq("id", id)
        .single();

      if (!existingRecipe || existingRecipe.user_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to edit this recipe" },
          { status: 403 }
        );
      }

      const { data: updatedRecipe, error: updateError } = await supabase
        .from("recipe_creation_prototype")
        .update({
          ...validatedRecipe,
          is_public: is_public !== undefined ? is_public : false
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      // Revalidate the recipe page
      revalidatePath(`/recipes/${id}`)

      // Revalidate paths when recipe is updated
      if (updatedRecipe.is_public) {
        
        // Revalidate the discover page
        revalidatePath("/ontdek")
      }

      return NextResponse.json({ recipe: updatedRecipe });
    } else {
      // Create new recipe
      const { data: savedRecipeData, error: supabaseError } = await supabase
        .from("recipe_creation_prototype")
        .insert([
          {
            user_id: user.id,
            ...validatedRecipe,
            is_public: is_public !== undefined ? is_public : false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (supabaseError) {
        console.error("Supabase Error Details:", {
          code: supabaseError.code,
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
        });
        return NextResponse.json(
          { error: "Failed to save recipe to database", details: supabaseError.message },
          { status: 500 }
        );
      }
      // Revalidate the recipe page
      revalidatePath(`/recipes/${savedRecipeData.id}`)

      // Revalidate paths when new recipe is created
      if (savedRecipeData.is_public) {
        
        // Revalidate the discover page
        revalidatePath("/ontdek")
      }

      return NextResponse.json(
        { message: "Recipe saved successfully", recipe: savedRecipeData },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      }).join(", ");

      return NextResponse.json(
        { error: `Invalid recipe data: ${errorMessages}` },
        { status: 400 }
      );
    }

    console.error("Error saving recipe:", error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 }
    );
  }
} 