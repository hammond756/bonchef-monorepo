import { create } from "zustand"

interface NavigationState {
    lastBrowsingPath: string
    setLastBrowsingPath: (path: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
    lastBrowsingPath: "/ontdek", // Default to /ontdek
    setLastBrowsingPath: (path) => set({ lastBrowsingPath: path }),
}))
