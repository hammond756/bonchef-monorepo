"use client"

import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useEffect } from "react"
import { useUiVisibilityStore } from "@/lib/store/ui-visibility-store"

export function useNavigationVisibility() {
    const scrollDirection = useScrollDirection()
    // Use local storage so that all components can access the same value
    const { isVisible, setIsVisible } = useUiVisibilityStore()

    useEffect(() => {
        if (scrollDirection === "down") {
            // Hide the top bar when scrolling down
            setIsVisible(false)
        } else if (scrollDirection === "up") {
            // Show the top bar when scrolling up
            setIsVisible(true)
        }
        // Tab bar always stays visible - no need to change isVisible for tab bar
    }, [scrollDirection, setIsVisible])

    return {
        isVisible,
        setIsVisible,
        scrollDirection,
    }
}
