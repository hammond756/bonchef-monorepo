"use client";

import { useState, useEffect, useRef } from "react";
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
import { 
  LoaderIcon, 
  ImageIcon, 
  RefreshCwIcon, 
  Trash2 as TrashIcon, 
  Plus as PlusIcon, 
  AlertCircle,
} from "lucide-react";
import type { Recipe, Unit } from "@/lib/types";
import { unitEnum } from "@/lib/types";
import { Alert, AlertDescription } from "./ui/alert";
import { useRouter } from "next/navigation";
import { deleteRecipe } from "@/app/edit/[id]/actions";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ImageGenerationModal } from "./image-generation-modal";
import { RecipeVisibilityModal } from "./recipe-visibility-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { unitMap } from "@/lib/utils";
import { fileToBase64 } from "@/lib/utils";

interface RecipeFormProps {
  recipe: Recipe;
  recipeId: string;  // Optional ID for edit mode
  isPublic?: boolean;
}

function autoResizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

function createDefaultIngredient(): Recipe["ingredients"][number]["ingredients"][number] {
  return {
    quantity: { type: "range", low: 0, high: 0 },
    unit: "g" as Unit,
    description: "",
  };
}

function updateIngredientInGroup(
  ingredients: Recipe["ingredients"],
  groupIdx: number,
  updateFn: (group: typeof ingredients[number]) => typeof ingredients[number]
) {
  return ingredients.map((group, idx) =>
    idx === groupIdx ? updateFn(group) : group
  );
}

function updateIngredientAtIndex(
  group: Recipe["ingredients"][number],
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

export function RecipeForm({ recipe: initialRecipe, recipeId, isPublic = false }: RecipeFormProps) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedRecipeUrl, setSavedRecipeUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [recipeVisibility, setRecipeVisibility] = useState<boolean>(isPublic);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const units = unitEnum.options;
  const router = useRouter();
  useEffect(() => {
    // Resize all textareas on mount and when recipe changes
    document.querySelectorAll("textarea").forEach((textarea) => {
      autoResizeTextarea(textarea);
    });
  }, [recipe]);

  async function handleGenerateImage(settings?: { 
    camera_angle?: string; 
    keukenstijl?: string 
  }) {
    setIsGenerating(true);
    setImageError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipe: recipe,
          prompt_variables: {
            camera_angle: settings?.camera_angle,
            keukenstijl: settings?.keukenstijl,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      
      // Simply set the image data in the recipe state
      // The server will handle the upload to Supabase Storage when saving
      setRecipe(prev => ({ ...prev, thumbnail: data.image }));
    } catch (error) {
      console.error("Failed to generate image:", error);
      setImageError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  // New function to handle direct image upload from device
  async function handleImageFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setImageError(null);
    
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Just set the base64 directly in the recipe state
      // The server will handle the upload to Supabase Storage when saving
      setRecipe(prev => ({ ...prev, thumbnail: base64 }));
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Close upload modal
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Failed to process image:", error);
      setImageError("Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSavedRecipeUrl(null);
    
    // Open the visibility modal instead of saving directly
    setIsVisibilityModalOpen(true);
  }

  async function saveRecipe(isPublic: boolean) {
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recipe,
          id: recipeId,
          is_public: isPublic
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.error);
        return;
      }

      const data = await response.json();
      router.push(`/recipes/${recipeId || data.recipe.id}`);
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setSubmitError("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
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
    updateFn: (ingredient: Recipe["ingredients"][number]["ingredients"][number]) => 
      Recipe["ingredients"][number]["ingredients"][number]
  ) {
    setRecipe((prev) => {
      const updatedIngredients = [...prev.ingredients];
      const group = updatedIngredients[groupIdx];
      if (group) {
        const newIngredients = [...group.ingredients];
        newIngredients[ingredientIdx] = updateFn(newIngredients[ingredientIdx]);
        updatedIngredients[groupIdx] = {
          ...group,
          ingredients: newIngredients
        };
      }
      return {
        ...prev,
        ingredients: updatedIngredients
      };
    });
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

  async function handleDeleteRecipe(recipeId: string) {
    try {
      await deleteRecipe(recipeId);
      router.push(`/`);
    } catch (error) {
      setSubmitError("Failed to delete recipe.");
      console.error("Failed to delete recipe:", error);
    }
  }

  const renderImageUploadModal = (
    <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">Upload Afbeelding</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="recipe-image" className="block text-sm font-medium">
            Select een bestand
          </Label>
          <Input
            ref={fileInputRef}
            id="recipe-image"
            type="file"
            accept="image/*"
            onChange={handleImageFileUpload}
            disabled={isUploading}
            className="w-full"
          />
          {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Annuleren
            </Button>
            <Button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Uploaden...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 items-start w-full">
          <div className="w-full">
            <div className="flex flex-col space-y-3">
              <h2 className="text-xl font-semibold">Afbeelding</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setIsImageModalOpen(true)}
                  data-testid="generate-image-button"
                >
                  {isGenerating ? (
                    <>
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    "Afbeelding genereren"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={isUploading}
                  data-testid="upload-image-button"
                >
                  {isUploading ? (
                    <>
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Upload afbeelding
                    </>
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
                <div className="w-full sm:-mx-6 md:-mx-8 lg:-mx-12 mt-4 relative group">
                  <img
                    src={recipe.thumbnail}
                    alt="Recipe preview"
                    data-testid="recipe-image-preview"
                    className="w-full h-[300px] md:h-[400px] object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white hover:bg-gray-100 text-gray-800"
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <RefreshCwIcon className="mr-2 h-4 w-4" />
                      Verander afbeelding
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Input
          className="bg-white"
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
          className="bg-white min-h-[100px] overflow-hidden"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Portie grootte</h2>
          <div className="flex items-center gap-2">
            <Input
              className="bg-white w-24"
              type="text"
              value={recipe.n_portions || ""}
              onChange={(e) =>
                setRecipe((prev) => ({
                  ...prev,
                  n_portions: parseInt(e.target.value),
                }))
              }
              placeholder="Porties"
              data-testid="portions-input"
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
            <div className="ingredients-list">
              {group.ingredients.map((ingredient, idx) => (
                <div 
                  key={`${groupIdx}-${idx}`} 
                  className="flex gap-2"
                  data-testid="ingredient-item"
                >
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
                    className="w-16 bg-white"
                    data-testid="ingredient-quantity"
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
                    <SelectTrigger
                      className="w-16 bg-white"
                      data-testid="ingredient-unit">
                      <SelectValue placeholder="Eenheid" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit} data-testid={`ingredient-unit-${unit}`}>
                          {renderUnitDisplay(unit)}
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
                    className="flex-1 bg-white"
                    data-testid="ingredient-description"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(groupIdx, idx)}
                    className="text-red-500 hover:text-red-700"
                    data-testid="remove-ingredient"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddIngredient(groupIdx)}
              className="mt-2"
              data-testid="add-ingredient"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ingredient toevoegen
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Bereiding</h2>
        {recipe.instructions.map((instruction, idx) => (
          <div key={idx} className="flex gap-2 items-start" data-testid={`instruction`}>
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
              className="min-h-[60px] overflow-hidden bg-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveInstruction(idx)}
              className="text-red-500 hover:text-red-700"
              data-testid="remove-instruction"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddInstruction}
          className="mt-2"
          data-testid="add-instruction"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Voeg stap toe
        </Button>
      </div>

      <div className="space-x-4 pb-8">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            data-testid="save-recipe"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              "Opslaan"
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push(`/recipes/${recipeId}`)}
            data-testid="cancel-recipe"
          >
            Annuleren
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="text-red-500 hover:text-red-700 border-red-500 hover:border-red-700"
            onClick={() => handleDeleteRecipe(recipeId)}
            data-testid="delete-recipe"
          >
            Verwijder recept
          </Button>
        </div>
      </div>

      <ImageGenerationModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSubmit={handleGenerateImage}
      />

      <RecipeVisibilityModal
        isOpen={isVisibilityModalOpen}
        onClose={() => setIsVisibilityModalOpen(false)}
        onConfirm={(isPublic: boolean) => saveRecipe(isPublic)}
        defaultVisibility={recipeVisibility}
      />

      {renderImageUploadModal}
    </form>
  );
}

function renderUnitDisplay(unit: Unit | undefined) {
  if (!unit) return "";
  return unitMap[unit].nl.singular || "<leeg>"
}