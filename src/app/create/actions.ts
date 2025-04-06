"use server"

import { createRecipeModel } from "@/lib/model-factory";
import Langfuse from "langfuse";
import { type Recipe } from "@/lib/types";


const DEV_RECIPE: Recipe = {
  title: "Classic Spaghetti Bolognese",
  description: "A rich and hearty Italian pasta dish with a meaty tomato sauce.",
  total_cook_time_minutes: 60,
  n_portions: 4,
  ingredients: [
    {
      name: "Pasta",
      ingredients: [
        { description: "Spaghetti", quantity: { type: "range", low: 400, high: 400 }, unit: "gram" }
      ]
    },
    // ... existing code for other ingredient groups ...
  ],
  instructions: [
    "Fill a large pot with water, add 1-2 tablespoons of salt, and bring to a rolling boil for cooking the pasta",
    // ... existing code for other instructions ...
  ],
  thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO89x8AAsEB3+IGkhwAAAAASUVORK5CYII=",
  source_url: "https://www.bonchef.io",
  source_name: "BonChef"
};

export async function generateRecipe(recipeText: string) {
  if (process.env.NODE_ENV != "production" && process.env.NEXT_PUBLIC_USE_FAKE_MODELS === "true") {
    return DEV_RECIPE
  }

  const langfuse = new Langfuse()

  const promptClient = await langfuse.getPrompt("FormatRecipe", undefined, {type: "chat"})
  const prompt = promptClient.compile({input: recipeText})

  const recipeModel = createRecipeModel("gpt-4o-mini", false)

  console.log("Generating recipe...", recipeText)
  const recipe = await recipeModel.invoke(prompt)

  return recipe
}
