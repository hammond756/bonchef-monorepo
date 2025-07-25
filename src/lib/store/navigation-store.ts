import { create } from "zustand"

interface NavigationState {
    history: string[]
    push: (path: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
    history: ["/ontdek"], // Start with a default path
    push: (path) =>
        set((state) => {
            if (state.history[state.history.length - 1] === path) return state
            return { history: [...state.history, path].slice(-10) }
        }),
}))
