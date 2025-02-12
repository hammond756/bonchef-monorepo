import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const recipeData = await request.json();
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BONCHEF_BACKEND_HOST}/generate_image/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({prompt: `A photorealistic image for ${recipeData.name} with the ingredients ${recipeData.ingredients.join(", ")}`}),
      }
    );

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ image: data.image });
    
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
} 