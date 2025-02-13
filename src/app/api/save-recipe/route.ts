import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ...recipe } = data;
    const validatedRecipe = GeneratedRecipeSchema.parse(recipe);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BONCHEF_BACKEND_HOST}/recipes/create_from_test_kitchen/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    console.error("Error saving recipe:", error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 }
    );
  }
} 