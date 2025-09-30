import { useState, useCallback, useEffect, useMemo } from 'react'
import type { RecipeUpdate } from '@repo/lib/services/recipes'

type EditState = 'idle' | 'editing' | 'saving' | 'error'

interface RecipeEditState {
  recipe: RecipeUpdate
  state: EditState
  errors: Record<string, string | undefined>
  errorMessage?: string
}

interface UseRecipeEditProps {
  initialRecipe: RecipeUpdate
}

export function useRecipeEdit({ initialRecipe }: UseRecipeEditProps) {
  console.log("initialRecipe in hook", initialRecipe.n_portions)
  const [editState, setEditState] = useState<RecipeEditState>({
    recipe: initialRecipe,
    state: 'idle',
    errors: {},
  })

  // Basic validation
  const validateRecipe = useCallback((recipe: RecipeUpdate): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {}

    if (!recipe.title.trim()) {
      errors.title = 'Titel is verplicht'
    }

    if (recipe.n_portions <= 0) {
      errors.n_portions = 'Aantal porties moet groter zijn dan 0'
    }

    if (recipe.total_cook_time_minutes <= 0) {
      errors.total_cook_time_minutes = 'Bereidingstijd moet groter zijn dan 0'
    }

    if (recipe.ingredients.length === 0) {
      errors.ingredients = 'Minimaal één ingrediënt is verplicht'
    }

    if (recipe.instructions.length === 0) {
      errors.instructions = 'Minimaal één instructie is verplicht'
    }

    // Validate source URL if provided
    if (recipe.source_url?.trim()) {
      try {
        new URL(recipe.source_url)
      } catch {
        errors.source_url = 'Ongeldige URL'
      }
    }

    return errors
  }, [])

  // Validate recipe whenever it changes
  useEffect(() => {
    const errors = validateRecipe(editState.recipe)
    setEditState((prev) => ({
      ...prev,
      errors,
    }))
  }, [editState.recipe, validateRecipe])

  // Computed values
  const hasUnsavedChanges = useMemo(() => {
    console.log("hasUnsavedChanges in hook edit", editState.recipe.n_portions)
    console.log("hasUnsavedChanges in hook initial", initialRecipe.n_portions)
    return JSON.stringify(editState.recipe) !== JSON.stringify(initialRecipe)
  }, [editState.recipe, initialRecipe])

  const canSave = useMemo(() => {
    return (
      Object.keys(editState.errors).length === 0 &&
      editState.state !== 'saving' &&
      hasUnsavedChanges
    )
  }, [editState.errors, editState.state, hasUnsavedChanges])

  const isSaving = editState.state === 'saving'

  // Actions
  const updateRecipe = useCallback((updates: Partial<RecipeUpdate>) => {
    setEditState((prev) => ({
      ...prev,
      recipe: { ...prev.recipe, ...updates },
      state: 'editing',
    }))
  }, [])

  const updateField = useCallback(
    (field: keyof RecipeUpdate, value: RecipeUpdate[keyof RecipeUpdate]) => {
      updateRecipe({ [field]: value })
    },
    [updateRecipe]
  )

  const updateIngredients = useCallback(
    (ingredients: RecipeUpdate['ingredients']) => {
      updateField('ingredients', ingredients)
    },
    [updateField]
  )

  const updateInstructions = useCallback(
    (instructions: string[]) => {
      updateField('instructions', instructions)
    },
    [updateField]
  )

  const setImageUrl = useCallback(
    (imageUrl: string | null) => {
      updateField('thumbnail', imageUrl || '')
    },
    [updateField]
  )

  const discardChanges = useCallback(() => {
    setEditState((prev) => ({
      ...prev,
      recipe: initialRecipe,
      state: 'idle',
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
    hasUnsavedChanges,
    canSave,

    // Actions
    updateRecipe,
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
    discardChanges,
  }
}
