import { NextResponse } from "next/server";
import { GeneratedRecipeSchema } from "@/lib/types";

export async function POST(request: Request) {
  const { text } = await request.json();

  // TODO: Implement actual API call
  // For now, return mock data
  const mockRecipe = {
    title: "Spaghetti Carbonara",
    total_cook_time_minutes: 30,
    ingredients: [
      {
        name: "no_group" as const,
        ingredients: [
          {
            unit: "gram" as const,
            description: "spaghetti",
            quantity: { type: "range" as const, low: 400, high: 400 },
          },
          {
            unit: "gram" as const,
            description: "pancetta",
            quantity: { type: "range" as const, low: 200, high: 200 },
          },
        ],
      },
    ],
    instructions: [
      "Boil the pasta according to package instructions",
      "Fry the pancetta until crispy",
    ],
    description: "Classic Italian pasta dish",
    n_portions: 4,
  };

  const parsedRecipe = GeneratedRecipeSchema.parse(mockRecipe);
  
  return NextResponse.json(parsedRecipe);
} 