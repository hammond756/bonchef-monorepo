"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { GeneratedRecipe, Unit } from "@/lib/types";
import { unitEnum } from "@/lib/types";

interface RecipeFormProps {
  recipe: GeneratedRecipe;
}

export function RecipeForm({ recipe: initialRecipe }: RecipeFormProps) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const units = unitEnum.options;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      
      const { url } = await response.json();
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          className="mb-4"
        />
        
        <Input
          value={recipe.title}
          onChange={(e) =>
            setRecipe((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Recipe Title"
        />

        <Textarea
          value={recipe.description}
          onChange={(e) =>
            setRecipe((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Description"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        {recipe.ingredients[0].ingredients.map((ingredient, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              type="number"
              value={ingredient.quantity?.low ?? ""}
              onChange={(e) =>
                setRecipe((prev) => ({
                  ...prev,
                  ingredients: [
                    {
                      ...prev.ingredients[0],
                      ingredients: prev.ingredients[0].ingredients.map((ing, i) =>
                        i === idx
                          ? {
                              ...ing,
                              quantity: {
                                type: "range",
                                low: Number(e.target.value),
                                high: Number(e.target.value),
                              },
                            }
                          : ing
                      ),
                    },
                  ],
                }))
              }
              className="w-24"
            />
            
            <Select
              value={ingredient.unit}
              onValueChange={(value: Unit) =>
                setRecipe((prev) => ({
                  ...prev,
                  ingredients: [
                    {
                      ...prev.ingredients[0],
                      ingredients: prev.ingredients[0].ingredients.map((ing, i) =>
                        i === idx ? { ...ing, unit: value } : ing
                      ),
                    },
                  ],
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={ingredient.description}
              onChange={(e) =>
                setRecipe((prev) => ({
                  ...prev,
                  ingredients: [
                    {
                      ...prev.ingredients[0],
                      ingredients: prev.ingredients[0].ingredients.map((ing, i) =>
                        i === idx
                          ? { ...ing, description: e.target.value }
                          : ing
                      ),
                    },
                  ],
                }))
              }
              className="flex-1"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Instructions</h2>
        {recipe.instructions.map((instruction, idx) => (
          <Textarea
            key={idx}
            value={instruction}
            onChange={(e) =>
              setRecipe((prev) => ({
                ...prev,
                instructions: prev.instructions.map((inst, i) =>
                  i === idx ? e.target.value : inst
                ),
              }))
            }
          />
        ))}
      </div>

      <Button type="submit">Save Recipe</Button>
    </form>
  );
} 