import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Recipe {
  id: string
  title: string
  thumbnail: string
  created_at: string
  profiles?: {
    display_name: string | null
  } | null
  user_id: string
}

interface RecipeTimelineState {
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[]) => void
  addRecipes: (recipes: Recipe[]) => void
  reset: () => void
}

const initialState = {
  recipes: [] as Recipe[],
}

export const useRecipeTimelineStore = create<RecipeTimelineState>()(
  persist(
    (set) => ({
      ...initialState,
      setRecipes: (recipes) => set({ recipes }),
      addRecipes: (newRecipes) => 
        set((state) => {
          const existingIds = new Set(state.recipes.map(r => r.id))
          const uniqueNewRecipes = newRecipes.filter(recipe => !existingIds.has(recipe.id))
          return {
            recipes: [...state.recipes, ...uniqueNewRecipes],
          }
        }),
      reset: () => set(initialState),
    }),
    {
      name: "recipe-timeline-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
) 