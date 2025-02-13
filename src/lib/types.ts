import { z } from "zod";

export const unitEnum = z.enum([
  "gram",
  "kilogram",
  "milligram",
  "milliliter",
  "liter",
  "teaspoon",
  "tablespoon",
  "slice",
  "whole",
  "clove",
  "bunch",
  "centimeter",
  "pinch",
  "dash",
  "handful",
  "can",
  "jar",
  "pack",
  "sheet",
  "sprig",
  "scoop",
  "none",
  "cup",
]);

export const IngredientSchema = z.object({
  unit: z.optional(unitEnum),
  description: z.string(),
  quantity: z.optional(
    z.object({
      type: z.literal("range"),
      low: z.number(),
      high: z.number(),
    })
  ),
});

export const GeneratedRecipeSchema = z.object({
  title: z.string(),
  total_cook_time_minutes: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      ingredients: z.array(IngredientSchema),
    }),
  ),
  instructions: z.array(z.string()),
  description: z.string(),
  n_portions: z.number(),
  thumbnail: z.string(), 
  source_url: z.string(),
  source_name: z.string(),
});

export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;
export type Unit = z.infer<typeof unitEnum>; 