import { create } from "zustand"

interface NavigationState {
    history: string[]
    push: (path: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
    history: ["/ontdek"], // Start with a default path
    push: (path) => set((state) => ({ history: [...state.history, path].slice(-10) })), // Keep last 10
}))
