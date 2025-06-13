"use client"

import { useState } from "react"
import { Loader2, Save, ExternalLink } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { GeneratedRecipe } from "@/lib/types"
import { generatedRecipeToRecipe } from "@/lib/utils"
import { RecipeDetail } from "./recipe-detail"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface RecipeModalProps {
    recipe: GeneratedRecipe | null
    isOpen: boolean
    onClose: () => void
    onRecipeSaved?: (url: string) => void
    canSave: boolean
}

export function RecipeModal({ recipe, isOpen, onClose, onRecipeSaved, canSave }: RecipeModalProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [savedRecipeUrl, setSavedRecipeUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    if (!recipe) return null

    const handleSaveRecipe = async () => {
        setIsSaving(true)
        setError(null)

        try {
            const response = await fetch("/api/save-recipe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...generatedRecipeToRecipe(recipe),
                    is_public: false, // Set recipes as private by default
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to save recipe")
            }

            const data = await response.json()
            const recipeUrl = `/recipes/${data.recipe.id}`
            setSavedRecipeUrl(recipeUrl)

            // Notify parent component that recipe was saved
            if (onRecipeSaved) {
                onRecipeSaved(recipeUrl)
            }

            setIsSaving(false)
        } catch (error) {
            console.error("Failed to save recipe:", error)
            setError("Er is iets misgegaan. Probeer het opnieuw.")
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-hidden rounded-lg sm:max-w-3xl">
                <VisuallyHidden>
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <RecipeDetail variant="generated" recipe={recipe} />
                </div>

                {/* Footer: non-scrollable and always visible */}
                <DialogFooter className="shrink-0">
                    <div className="flex w-full flex-col justify-between space-y-2">
                        <div className="w-full justify-center">
                            {savedRecipeUrl ? (
                                <a
                                    href={savedRecipeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-green-500 bg-white px-4 py-2 text-sm font-medium text-green-600 shadow-md transition-colors hover:bg-green-50"
                                    data-testid="recipe-modal-view-recipe-button"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                    <span>Bekijk recept</span>
                                </a>
                            ) : (
                                <button
                                    onClick={handleSaveRecipe}
                                    disabled={isSaving || !canSave}
                                    className={`flex w-full items-center justify-center gap-2 rounded-md border-2 border-green-500 bg-white px-4 py-2 text-sm font-medium text-green-600 shadow-md transition-colors hover:bg-green-50 ${
                                        !canSave ? "cursor-not-allowed opacity-50" : ""
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
                        {error && <div className="rounded-md text-sm text-red-500">{error}</div>}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
