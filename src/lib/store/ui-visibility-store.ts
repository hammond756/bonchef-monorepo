import { create } from "zustand"

interface UiVisibilityState {
    isVisible: boolean
    setIsVisible: (isVisible: boolean) => void
}

export const useUiVisibilityStore = create<UiVisibilityState>((set) => ({
    isVisible: true,
    setIsVisible: (isVisible) => set({ isVisible }),
}))
