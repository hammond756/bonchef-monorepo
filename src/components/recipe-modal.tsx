"use client";

import { useState } from "react";
import { Loader2, Save, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GeneratedRecipe } from "@/lib/types";
import { generatedRecipeToRecipe } from "@/lib/utils";
import { RecipeDetail } from "./recipe-detail";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface RecipeModalProps {
  recipe: GeneratedRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved?: (url: string) => void;
  canSave: boolean;
}

export function RecipeModal({ recipe, isOpen, onClose, onRecipeSaved, canSave }: RecipeModalProps) {
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] min-h-[90vh] overflow-hidden flex flex-col rounded-lg">
        <VisuallyHidden>
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 pr-2">
          <RecipeDetail variant="generated" recipe={recipe} />
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
                  <ExternalLink className="w-5 h-5"/> 
                  <span>Bekijk recept</span>
                </a>
              ) : (
                <button
                  onClick={handleSaveRecipe}
                  disabled={isSaving || !canSave}
                  className={`w-full justify-center px-4 py-2 rounded-md bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium shadow-md flex items-center gap-2 ${
                    !canSave ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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