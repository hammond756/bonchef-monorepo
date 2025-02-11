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
            unit: "whole" as const,
            description: "eggs",
            quantity: { type: "range" as const, low: 4, high: 4 },
          },
        ],
      },
      {
        name: "Toevoegingen" as const,
        ingredients: [
          {
            unit: "gram" as const,
            description: "pancetta",
            quantity: { type: "range" as const, low: 200, high: 200 },
          },
          {
            unit: "gram" as const,
            description: "pecorino cheese",
            quantity: { type: "range" as const, low: 100, high: 100 },
          },
          {
            unit: "pinch" as const,
            description: "black pepper",
            quantity: { type: "range" as const, low: 1, high: 1 },
          },
        ],
      },
    ],
    instructions: [
      "Boil the pasta according to package instructions",
      "Fry the pancetta until crispy",
      "Mix eggs with grated pecorino",
      "Combine everything while pasta is hot",
      "Season generously with black pepper",
    ],
    description: "Classic Italian pasta dish",
    n_portions: 4,
  };

  const parsedRecipe = GeneratedRecipeSchema.parse(mockRecipe);
  
  return NextResponse.json(parsedRecipe);
} 