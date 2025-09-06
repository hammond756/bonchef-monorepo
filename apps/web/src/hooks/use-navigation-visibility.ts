"use client"

import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useEffect } from "react"
import { useUiVisibilityStore } from "@/lib/store/ui-visibility-store"

export function useNavigationVisibility() {
    const scrollDirection = useScrollDirection()
    // Use local storage so that all components can access the same value
    const { isVisible, setIsVisible: _setIsVisible } = useUiVisibilityStore()

    useEffect(() => {
        if (scrollDirection === "down") {
            _setIsVisible(false)
        } else if (scrollDirection === "up") {
            _setIsVisible(true)
        }
    }, [scrollDirection, _setIsVisible])

    return { isVisible, setIsVisible: _setIsVisible, scrollDirection }
}
