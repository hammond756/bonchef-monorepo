"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, X, Save, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GeneratedRecipe, Recipe } from "@/lib/types";
import { unitAbbreviations } from "@/lib/types";
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants";
import { generatedRecipeToRecipe } from "@/lib/utils";
interface RecipeModalProps {
  recipe: GeneratedRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved?: (url: string) => void;
}

export function RecipeModal({ recipe, isOpen, onClose, onRecipeSaved }: RecipeModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeUrl, setSavedRecipeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!recipe) return null;

  const handleSaveRecipe = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...generatedRecipeToRecipe(recipe),
          is_public: false // Set recipes as private by default
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      const data = await response.json();
      const recipeUrl = `/recipes/${data.recipe.id}`;
      setSavedRecipeUrl(recipeUrl);
      
      // Notify parent component that recipe was saved
      if (onRecipeSaved) {
        onRecipeSaved(recipeUrl);
      }
      
      setIsSaving(false);
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setError("Er is iets misgegaan. Probeer het opnieuw.");
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="space-y-6 pb-4"> 
            {/* Recipe Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div>Porties: {recipe.n_portions}</div>
              <div>Bereidingstijd: {recipe.total_cook_time_minutes} minuten</div>
            </div>

          {/* Description */}
          {/* <div>
            <p className="text-gray-700">{recipe.description}</p>
          </div> */}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Ingredients */}
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-2">Ingrediënten</h2>
                <Separator className="mb-4" />
                {recipe.ingredients && recipe.ingredients.map((group, index) => (
                  <div key={index} className="mb-4">
                    {group.name !== "no_group" && (
                      <h3 className="font-medium mb-2">{group.name}</h3>
                    )}
                    <ul className="space-y-2">
                      {group.ingredients && group.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-gray-600">
                          {ingredient.quantity?.low || ""}{" "}
                          {ingredient.unit && ingredient.unit !== "none"
                            ? unitAbbreviations[ingredient.unit] || ingredient.unit
                            : ""}{" "}
                          {ingredient.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>

              {/* Instructions */}
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-2">Instructies</h2>
                <Separator className="mb-4" />
                <ol className="space-y-3 list-decimal list-inside">
                  {recipe.instructions && recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-600">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer: non-scrollable and always visible */}
        <DialogFooter className="flex-shrink-0">
          <div className="flex flex-col w-full justify-between space-y-2">
            <div className="w-full justify-center">
              {savedRecipeUrl ? (
                <a
                  href={savedRecipeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full justify-center px-4 py-2 rounded-md bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium shadow-md flex items-center gap-2"
                  data-testid="recipe-modal-view-recipe-button"
                >
                <>
                <ExternalLink className="w-5 h-5"/> 
                  <span>Bekijk recept</span>
                </>
                </a>
              ) : (
                <button
                  onClick={handleSaveRecipe}
                  disabled={isSaving}
                  className="w-full justify-center px-4 py-2 rounded-md bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium shadow-md flex items-center gap-2"
                  data-testid="recipe-modal-save-recipe-button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Opslaan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Opslaan in collectie</span>
                    </>
                  )}
                </button>
              )}
              
            </div>
                        {error && (
              <div className="text-red-500 rounded-md text-sm">{error}</div>
            )}
            
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 