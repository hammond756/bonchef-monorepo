import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";
import { ZodError } from "zod";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Create Supabase server client
    const supabase = await createClient();
    
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { ...recipe } = data;
    const validatedRecipe = GeneratedRecipeSchema.parse(recipe);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BONCHEF_BACKEND_HOST}/recipes/create_from_test_kitchen/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          // source_url: "https://www.bonchef.io",
          // source_name: "BonChef",
          ...validatedRecipe,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        return NextResponse.json({ error: errorData.error }, { status: 400 });
      }
      throw new Error(`Failed to save recipe: ${response.statusText}`);
    }

    const savedRecipe = await response.json();
    return NextResponse.json({ url: `/recipe/${savedRecipe.slug}` });
  } catch (error) {
    if (error instanceof ZodError) {
      // Format validation errors into a readable message
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