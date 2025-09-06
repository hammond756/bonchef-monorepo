import { create } from "zustand"
import { ImportMode } from "@/lib/types"

interface ImportStatusState {
    activeModal: ImportMode
    openModal: (mode: ImportMode) => void
    closeModal: () => void

    // Animation state for fly-to-collection
    isAnimatingToCollection: boolean
    startAnimationToCollection: () => void
    finishAnimationToCollection: () => void

    // Recipe completion tracking
    lastProcessedRecipeId: string | null
    setLastProcessedRecipe: (recipeId: string) => void
    clearLastProcessedRecipe: () => void
}

export const useImportStatusStore = create<ImportStatusState>((set) => ({
    activeModal: null,
    openModal: (mode: ImportMode) => set({ activeModal: mode }),
    closeModal: () => set({ activeModal: null }),

    isAnimatingToCollection: false,
    startAnimationToCollection: () => set({ isAnimatingToCollection: true }),
    finishAnimationToCollection: () => set({ isAnimatingToCollection: false }),

    lastProcessedRecipeId: null,
    setLastProcessedRecipe: (recipeId: string) => set({ lastProcessedRecipeId: recipeId }),
    clearLastProcessedRecipe: () => set({ lastProcessedRecipeId: null }),
}))
