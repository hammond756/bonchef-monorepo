import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";
import { ZodError } from "zod";
import { createClient } from "@/utils/supabase/server";

// Helper function to check if string is a valid URL
function isValidUrl(urlString: string) {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// Helper function to convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64String}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
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
    const { id, ...recipe } = data;
    const validatedRecipe = GeneratedRecipeSchema.parse(recipe);

    // Process thumbnail if it's a URL
    if (validatedRecipe.thumbnail && 
        isValidUrl(validatedRecipe.thumbnail) && 
        !validatedRecipe.thumbnail.startsWith("data:")) {
      try {
        validatedRecipe.thumbnail = await imageUrlToBase64(validatedRecipe.thumbnail);
      } catch (error) {
        console.error("Error processing thumbnail:", error);
        return NextResponse.json(
          { error: "Failed to process thumbnail image" },
          { status: 500 }
        );
      }
    }

    if (id) {
      // Update existing recipe
      const { data: existingRecipe } = await supabase
        .from("recipe_creation_prototype")
        .select("user_id")
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
        .update(validatedRecipe)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json({ recipe: updatedRecipe });
    } else {
      // Create new recipe
      const { data: savedRecipeData, error: supabaseError } = await supabase
        .from("recipe_creation_prototype")
        .insert([
          {
            user_id: user.id,
            ...validatedRecipe,
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