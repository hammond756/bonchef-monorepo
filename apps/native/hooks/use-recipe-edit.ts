import { useState, useCallback, useEffect, useMemo } from 'react'
import type { RecipeRead } from '@repo/lib/services/recipes'

type EditState = 'idle' | 'editing' | 'saving' | 'error'

interface RecipeEditState {
  recipe: RecipeRead
  state: EditState
  errors: Record<string, string | undefined>
  errorMessage?: string
}

interface UseRecipeEditProps {
  initialRecipe: RecipeRead
}

export function useRecipeEdit({ initialRecipe }: UseRecipeEditProps) {
  const [editState, setEditState] = useState<RecipeEditState>({
    recipe: initialRecipe,
    state: 'idle',
    errors: {},
  })

  // Basic validation
  const validateRecipe = useCallback((recipe: RecipeRead): Record<string, string | undefined> => {
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
  const isDirty = useMemo(() => {
    return JSON.stringify(editState.recipe) !== JSON.stringify(initialRecipe)
  }, [editState.recipe, initialRecipe])

  const canSave = useMemo(() => {
    return (
      Object.keys(editState.errors).length === 0 &&
      editState.state !== 'saving' &&
      isDirty
    )
  }, [editState.errors, editState.state, isDirty])

  const isSaving = editState.state === 'saving'
  const hasUnsavedChanges = isDirty

  // Actions
  const updateRecipe = useCallback((updates: Partial<RecipeRead>) => {
    setEditState((prev) => ({
      ...prev,
      recipe: { ...prev.recipe, ...updates },
      state: 'editing',
    }))
  }, [])

  const updateField = useCallback(
    (field: keyof RecipeRead, value: RecipeRead[keyof RecipeRead]) => {
      updateRecipe({ [field]: value })
    },
    [updateRecipe]
  )

  const updateIngredients = useCallback(
    (ingredients: RecipeRead['ingredients']) => {
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

  const saveRecipe = useCallback(
    async (isPublic: boolean = false) => {
      if (!canSave) {
        setEditState((prev) => ({
          ...prev,
          state: 'error',
          errorMessage: 'Kan niet opslaan: controleer de fouten in het formulier',
        }))
        return
      }

      setEditState((prev) => ({
        ...prev,
        state: 'saving',
        errorMessage: undefined,
      }))

      try {
        // TODO: Implement actual save logic
        console.log('Saving recipe:', { ...editState.recipe, is_public: isPublic })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setEditState((prev) => ({
          ...prev,
          state: 'idle',
        }))
      } catch (error) {
        setEditState((prev) => ({
          ...prev,
          state: 'error',
          errorMessage: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het opslaan',
        }))
      }
    },
    [canSave, editState.recipe]
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
    isDirty,
    canSave,

    // Actions
    updateRecipe,
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
    saveRecipe,
    discardChanges,
  }
}
