"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Recipe } from "@/lib/types"
import {
    validateRecipe,
    isRecipeValid,
    RecipeValidationErrors,
} from "@/lib/validation/recipe-validation"

type EditState = "idle" | "editing" | "saving" | "generating" | "error"

interface RecipeEditState {
    recipe: Recipe
    state: EditState
    errors: RecipeValidationErrors
    errorMessage?: string
}

interface UseRecipeEditProps {
    initialRecipe: Recipe
}

export function useRecipeEdit({ initialRecipe }: UseRecipeEditProps) {
    const [editState, setEditState] = useState<RecipeEditState>({
        recipe: initialRecipe,
        state: "idle",
        errors: {},
    })

    // Validate recipe whenever it changes
    useEffect(() => {
        const errors = validateRecipe(editState.recipe)
        setEditState((prev) => ({
            ...prev,
            errors,
        }))
    }, [editState.recipe])

    // Computed values
    const isDirty = useMemo(() => {
        return JSON.stringify(editState.recipe) !== JSON.stringify(initialRecipe)
    }, [editState.recipe, initialRecipe])

    const canSave = useMemo(() => {
        return (
            isRecipeValid(editState.recipe) &&
            editState.state !== "saving" &&
            editState.state !== "generating"
        )
    }, [editState.recipe, editState.state])

    const isSaving = editState.state === "saving"
    const isGenerating = editState.state === "generating"
    const hasUnsavedChanges = isDirty

    // Actions
    const updateRecipe = useCallback((updates: Partial<Recipe>) => {
        setEditState((prev) => ({
            ...prev,
            recipe: { ...prev.recipe, ...updates },
            state: "editing",
        }))
    }, [])

    const updateField = useCallback(
        (field: keyof Recipe, value: Recipe[keyof Recipe]) => {
            updateRecipe({ [field]: value })
        },
        [updateRecipe]
    )

    const updateIngredients = useCallback(
        (ingredients: Recipe["ingredients"]) => {
            updateField("ingredients", ingredients)
        },
        [updateField]
    )

    const updateInstructions = useCallback(
        (instructions: string[]) => {
            updateField("instructions", instructions)
        },
        [updateField]
    )

    const setImageUrl = useCallback(
        (imageUrl: string | null) => {
            updateField("thumbnail", imageUrl || "")
        },
        [updateField]
    )

    const setGenerating = useCallback((isGenerating: boolean) => {
        setEditState((prev) => ({
            ...prev,
            state: isGenerating ? "generating" : "editing",
        }))
    }, [])

    const saveRecipe = useCallback(
        async (isPublic: boolean = false) => {
            if (!isRecipeValid(editState.recipe)) {
                throw new Error("Recipe is not valid")
            }

            setEditState((prev) => ({
                ...prev,
                state: "saving",
                errorMessage: undefined,
            }))

            try {
                const response = await fetch(`/api/save-recipe`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...editState.recipe,
                        is_public: isPublic,
                        status: "PUBLISHED",
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to save recipe")
                }

                const result = await response.json()

                if (result.error) {
                    throw new Error(result.error)
                }

                // Update local state
                setEditState((prev) => ({
                    ...prev,
                    state: "idle",
                }))

                return result
            } catch (error) {
                setEditState((prev) => ({
                    ...prev,
                    state: "error",
                    errorMessage: error instanceof Error ? error.message : "Unknown error",
                }))
                throw error
            }
        },
        [editState.recipe]
    )

    const discardChanges = useCallback(() => {
        setEditState((prev) => ({
            ...prev,
            recipe: initialRecipe,
            state: "idle",
            errors: {},
        }))
    }, [initialRecipe])

    return {
        // State
        recipe: editState.recipe,
        state: editState.state,
        errors: editState.errors,
        errorMessage: editState.errorMessage,
        isSaving,
        isGenerating,
        hasUnsavedChanges,
        isDirty,
        canSave,

        // Actions
        updateRecipe,
        updateField,
        updateIngredients,
        updateInstructions,
        setImageUrl,
        setGenerating,
        saveRecipe,
        discardChanges,
    }
}
