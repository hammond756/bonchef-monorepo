import { createContext, useContext, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import type { RecipeRead as Recipe } from '@repo/lib/services/recipes'
import { useRecipeEdit } from '@/hooks/use-recipe-edit'

interface RecipeEditContextValue {
  // State
  recipe: Recipe
  errors: Record<string, string | undefined>
  isSaving: boolean
  hasUnsavedChanges: boolean
  canSave: boolean
  isVisibilityModalOpen: boolean

  // Actions
  updateField: (field: keyof Recipe, value: Recipe[keyof Recipe]) => void
  updateIngredients: (ingredients: Recipe['ingredients']) => void
  updateInstructions: (instructions: string[]) => void
  setImageUrl: (imageUrl: string | null) => void
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
  const {
    recipe: currentRecipe,
    errors,
    isSaving,
    hasUnsavedChanges,
    canSave,
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
    saveRecipe,
  } = useRecipeEdit({ initialRecipe: recipe })

  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)

  const handleSave = useCallback(() => {
    if (!canSave) {
      // In native, we'll show an alert instead of toast
      return
    }
    setIsVisibilityModalOpen(true)
  }, [canSave])

  const value: RecipeEditContextValue = {
    // State
    recipe: currentRecipe,
    errors,
    isSaving,
    hasUnsavedChanges,
    canSave,
    isVisibilityModalOpen,

    // Actions
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
    saveRecipe,
    handleSave,
    closeVisibilityModal: () => setIsVisibilityModalOpen(false),
  }

  return <RecipeEditContext.Provider value={value}>{children}</RecipeEditContext.Provider>
}

export function useRecipeEditContext() {
  const context = useContext(RecipeEditContext)
  if (!context) {
    throw new Error('useRecipeEditContext must be used within a RecipeEditProvider')
  }
  return context
}
