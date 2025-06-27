"use client"

import { useEffect } from "react"
import { useNavigationStore } from "@/lib/store/navigation-store"

interface NavigationTrackerProps {
    path: string
}

export function NavigationTracker({ path }: NavigationTrackerProps) {
    const setLastBrowsingPath = useNavigationStore((state) => state.setLastBrowsingPath)

    useEffect(() => {
        setLastBrowsingPath(path)
    }, [path, setLastBrowsingPath])

    return null // This component renders nothing to the DOM.
}
