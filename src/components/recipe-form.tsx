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
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const units = unitEnum.options;

  async function handleGenerateImage() {
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
      });
      const data = await response.json();
      setRecipeImage(data.image);
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recipe,
          image: recipeImage,
        }),
      });
      
      const { url } = await response.json();
      window.open(`${process.env.NEXT_PUBLIC_BONCHEF_FRONTEND_HOST}${url}`, "_blank");
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Button
            type="button"
            onClick={handleGenerateImage}
            className="w-40"
          >
            Generate Image
          </Button>
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              className="mb-4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setRecipeImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {recipeImage && (
              <img
                src={recipeImage}
                alt="Recipe preview"
                className="w-40 h-40 object-cover rounded-md"
              />
            )}
          </div>
        </div>
        
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

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        {recipe.ingredients.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-4">
            {group.name !== "no_group" && (
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {group.name}
              </h3>
            )}
            {group.ingredients.map((ingredient, idx) => (
              <div key={`${groupIdx}-${idx}`} className="flex gap-2">
                <Input
                  type="number"
                  value={ingredient.quantity?.low ?? ""}
                  onChange={(e) =>
                    setRecipe((prev) => ({
                      ...prev,
                      ingredients: prev.ingredients.map((g, gIdx) =>
                        gIdx === groupIdx
                          ? {
                              ...g,
                              ingredients: g.ingredients.map((ing, i) =>
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
                            }
                          : g
                      ),
                    }))
                  }
                  className="w-24"
                />
                
                <Select
                  value={ingredient.unit}
                  onValueChange={(value: Unit) =>
                    setRecipe((prev) => ({
                      ...prev,
                      ingredients: prev.ingredients.map((g, gIdx) =>
                        gIdx === groupIdx
                          ? {
                              ...g,
                              ingredients: g.ingredients.map((ing, i) =>
                                i === idx ? { ...ing, unit: value } : ing
                              ),
                            }
                          : g
                      ),
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
                      ingredients: prev.ingredients.map((g, gIdx) =>
                        gIdx === groupIdx
                          ? {
                              ...g,
                              ingredients: g.ingredients.map((ing, i) =>
                                i === idx
                                  ? { ...ing, description: e.target.value }
                                  : ing
                              ),
                            }
                          : g
                      ),
                    }))
                  }
                  className="flex-1"
                />
              </div>
            ))}
            {groupIdx < recipe.ingredients.length - 1 && (
              <hr className="border-t border-gray-200 dark:border-gray-700" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Instructions</h2>
        {recipe.instructions.map((instruction, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 w-6">
              {idx + 1}.
            </span>
            <Textarea
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
          </div>
        ))}
      </div>

      <Button type="submit">Save Recipe</Button>
    </form>
  );
} 