import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";

export async function POST(request: Request) {
  const data = await request.json();
  const { image, ...recipe } = data;
  const validatedRecipe = GeneratedRecipeSchema.parse(recipe);

  // TODO: Implement actual save logic including image storage
  // For now, return a mock URL
  return NextResponse.json({ url: "/recipes/mock-id" });
} 