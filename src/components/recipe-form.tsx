"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import type { GeneratedRecipe, Unit } from "@/lib/types";
import { unitEnum, unitAbbreviations } from "@/lib/types";
import { Alert, AlertDescription } from "./ui/alert";

interface RecipeFormProps {
  recipe: GeneratedRecipe;
}

function autoResizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

function createDefaultIngredient(): GeneratedRecipe["ingredients"][number]["ingredients"][number] {
  return {
    quantity: { type: "range", low: 0, high: 0 },
    unit: "g" as Unit,
    description: "",
  };
}

function updateIngredientInGroup(
  ingredients: GeneratedRecipe["ingredients"],
  groupIdx: number,
  updateFn: (group: typeof ingredients[number]) => typeof ingredients[number]
) {
  return ingredients.map((group, idx) =>
    idx === groupIdx ? updateFn(group) : group
  );
}

function updateIngredientAtIndex(
  group: GeneratedRecipe["ingredients"][number],
  ingredientIdx: number,
  updateFn: (ingredient: typeof group["ingredients"][number]) => typeof group["ingredients"][number]
) {
  return {
    ...group,
    ingredients: group.ingredients.map((ing, idx) =>
      idx === ingredientIdx ? updateFn(ing) : ing
    ),
  };
}

export function RecipeForm({ recipe: initialRecipe }: RecipeFormProps) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const units = unitEnum.options;

  useEffect(() => {
    // Resize all textareas on mount and when recipe changes
    document.querySelectorAll("textarea").forEach((textarea) => {
      autoResizeTextarea(textarea);
    });
  }, [recipe]);

  async function handleGenerateImage() {
    setIsGenerating(true);
    setImageError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setRecipe(prev => ({ ...prev, thumbnail: data.image }));
    } catch (error) {
      console.error("Failed to generate image:", error);
      setImageError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.error);
        return;
      }
      
      const { url } = await response.json();
      window.open(`${process.env.NEXT_PUBLIC_BONCHEF_FRONTEND_HOST}${url}`, "_blank");
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setSubmitError("Failed to save recipe. Please try again.");
    }
  }

  function handleTextareaChange(
    e: React.ChangeEvent<HTMLTextAreaElement>,
    updateFn: (value: string) => void
  ) {
    autoResizeTextarea(e.target);
    updateFn(e.target.value);
  }

  function handleAddIngredient(groupIdx: number) {
    setRecipe((prev) => ({
      ...prev,
      ingredients: updateIngredientInGroup(prev.ingredients, groupIdx, (group) => ({
        ...group,
        ingredients: [...group.ingredients, createDefaultIngredient()],
      })),
    }));
  }

  function handleRemoveIngredient(groupIdx: number, ingredientIdx: number) {
    setRecipe((prev) => ({
      ...prev,
      ingredients: updateIngredientInGroup(prev.ingredients, groupIdx, (group) => ({
        ...group,
        ingredients: group.ingredients.filter((_, idx) => idx !== ingredientIdx),
      })),
    }));
  }

  function handleIngredientChange(
    groupIdx: number,
    ingredientIdx: number,
    updateFn: (ingredient: GeneratedRecipe["ingredients"][number]["ingredients"][number]) => 
      GeneratedRecipe["ingredients"][number]["ingredients"][number]
  ) {
    setRecipe((prev) => ({
      ...prev,
      ingredients: updateIngredientInGroup(prev.ingredients, groupIdx, (group) =>
        updateIngredientAtIndex(group, ingredientIdx, updateFn)
      ),
    }));
  }

  function handleAddInstruction() {
    setRecipe((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  }

  function handleRemoveInstruction(idx: number) {
    setRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== idx),
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 items-start w-full">
          <div className="w-full">
            <Input
              type="file"
              accept="image/*"
              className="mb-4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setRecipe(prev => ({ ...prev, thumbnail: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGenerating}
                variant="secondary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Afbeelding genereren...
                  </>
                ) : (
                  "Afbeelding genereren"
                )}
              </Button>

              {imageError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{imageError}</AlertDescription>
                </Alert>
              )}
            </div>

            {recipe.thumbnail && (
              <div className="w-full sm:-mx-6 md:-mx-8 lg:-mx-12 mt-4">
                <img
                  src={recipe.thumbnail}
                  alt="Recipe preview"
                  className="w-full h-[300px] md:h-[400px] object-contain"
                />
              </div>
            )}
          </div>
        </div>
        
        <Input
          value={recipe.title}
          onChange={(e) =>
            setRecipe((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Recept naam"
        />

        <Textarea
          value={recipe.description}
          onChange={(e) =>
            handleTextareaChange(e, (value) =>
              setRecipe((prev) => ({ ...prev, description: value }))
            )
          }
          placeholder="Beschrijving"
          className="min-h-[100px] overflow-hidden"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Portie grootte</h2>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={recipe.n_portions || ""}
              onChange={(e) =>
                setRecipe((prev) => ({
                  ...prev,
                  n_portions: parseInt(e.target.value),
                }))
              }
              className="w-24"
              placeholder="Porties"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">porties</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold">Ingredienten</h2>
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
                  type="text"
                  value={ingredient.quantity?.low || ""}
                  onChange={(e) =>
                    handleIngredientChange(groupIdx, idx, (ing) => ({
                      ...ing,
                      quantity: {
                        type: "range",
                        low: e.target.value === "" ? 0 : parseFloat(e.target.value),
                        high: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-16"
                />
                
                <Select
                  value={ingredient.unit}
                  onValueChange={(value: Unit) =>
                    handleIngredientChange(groupIdx, idx, (ing) => ({
                      ...ing,
                      unit: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="Eenheid" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unitAbbreviations[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  value={ingredient.description}
                  onChange={(e) =>
                    handleIngredientChange(groupIdx, idx, (ing) => ({
                      ...ing,
                      description: e.target.value,
                    }))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveIngredient(groupIdx, idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddIngredient(groupIdx)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ingredient toevoegen
            </Button>
            {groupIdx < recipe.ingredients.length - 1 && (
              <hr className="border-t border-gray-200 dark:border-gray-700" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Bereiding</h2>
        {recipe.instructions.map((instruction, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 w-6">
              {idx + 1}.
            </span>
            <Textarea
              value={instruction}
              onChange={(e) =>
                handleTextareaChange(e, (value) =>
                  setRecipe((prev) => ({
                    ...prev,
                    instructions: prev.instructions.map((inst, i) =>
                      i === idx ? value : inst
                    ),
                  }))
                )
              }
              className="min-h-[60px] overflow-hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveInstruction(idx)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddInstruction}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Voeg stap toe
        </Button>
      </div>

      <div className="space-y-4 pb-8">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit">Opslaan</Button>
      </div>
    </form>
  );
} 