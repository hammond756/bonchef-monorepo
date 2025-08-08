"use client"

import { createContext, useContext, ReactNode, useCallback, useState } from "react"
import { Recipe } from "@/lib/types"
import { useRecipeEdit } from "@/hooks/use-recipe-edit"
import { RecipeValidationErrors } from "@/lib/validation/recipe-validation"
import { useToast } from "@/hooks/use-toast"

interface RecipeEditContextValue {
    // State
    recipe: Recipe
    errors: RecipeValidationErrors
    isSaving: boolean
    isGenerating: boolean
    hasUnsavedChanges: boolean
    canSave: boolean
    isVisibilityModalOpen: boolean

    // Actions
    updateField: (field: keyof Recipe, value: Recipe[keyof Recipe]) => void
    updateIngredients: (ingredients: Recipe["ingredients"]) => void
    updateInstructions: (instructions: string[]) => void
    setImageUrl: (imageUrl: string | null) => void
    setGenerating: (isGenerating: boolean) => void
    saveRecipe: (isPublic: boolean) => Promise<void>
    handleSave: () => void
    closeVisibilityModal: () => void
}

const RecipeEditContext = createContext<RecipeEditContextValue | null>(null)

interface RecipeEditProviderProps {
    children: ReactNode
    recipe: Recipe
}

export function RecipeEditProvider({ children, recipe }: RecipeEditProviderProps) {
    const { toast } = useToast()

    const {
        recipe: currentRecipe,
        errors,
        isSaving,
        isGenerating,
        hasUnsavedChanges,
        canSave,
        updateField,
        updateIngredients,
        updateInstructions,
        setImageUrl,
        setGenerating,
        saveRecipe,
    } = useRecipeEdit({ initialRecipe: recipe })

    const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)

    const handleSave = useCallback(() => {
        if (!canSave) {
            toast({
                title: "Kan niet opslaan",
                description: "Controleer de fouten in het formulier.",
                variant: "destructive",
            })
            return
        }
        setIsVisibilityModalOpen(true)
    }, [canSave, toast])

    const value: RecipeEditContextValue = {
        // State
        recipe: currentRecipe,
        errors,
        isSaving,
        isGenerating,
        hasUnsavedChanges,
        canSave,
        isVisibilityModalOpen,

        // Actions
        updateField,
        updateIngredients,
        updateInstructions,
        setImageUrl,
        setGenerating,
        saveRecipe,
        handleSave,
        closeVisibilityModal: () => setIsVisibilityModalOpen(false),
    }

    return <RecipeEditContext.Provider value={value}>{children}</RecipeEditContext.Provider>
}

export function useRecipeEditContext() {
    const context = useContext(RecipeEditContext)
    if (!context) {
        throw new Error("useRecipeEditContext must be used within a RecipeEditProvider")
    }
    return context
}
