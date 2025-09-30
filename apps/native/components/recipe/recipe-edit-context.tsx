import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { RecipeUpdate } from '@repo/lib/services/recipes'
import { useRecipeEdit } from '@/hooks/use-recipe-edit'

interface RecipeEditContextValue {
  // State
  recipe: RecipeUpdate
  errors: Record<string, string | undefined>
  hasUnsavedChanges: boolean
  canSave: boolean
  isVisibilityModalOpen: boolean

  // Actions
  updateField: (field: keyof RecipeUpdate, value: RecipeUpdate[keyof RecipeUpdate]) => void
  updateIngredients: (ingredients: RecipeUpdate['ingredients']) => void
  updateInstructions: (instructions: string[]) => void
  setImageUrl: (imageUrl: string | null) => void
  closeVisibilityModal: () => void
}

const RecipeEditContext = createContext<RecipeEditContextValue | null>(null)

interface RecipeEditProviderProps {
  children: ReactNode
  recipe: RecipeUpdate
}

export function RecipeEditProvider({ children, recipe }: RecipeEditProviderProps) {
    console.log("recipe in provider", recipe)
  const {
    recipe: currentRecipe,
    errors,
    hasUnsavedChanges,
    canSave,
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
  } = useRecipeEdit({ initialRecipe: recipe })

  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)

  const value: RecipeEditContextValue = {
    // State
    recipe: currentRecipe,
    errors,
    hasUnsavedChanges,
    canSave,
    isVisibilityModalOpen,

    // Actions
    updateField,
    updateIngredients,
    updateInstructions,
    setImageUrl,
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
