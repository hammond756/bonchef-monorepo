"use client"

import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useState, useEffect } from "react"

export function useNavigationVisibility() {
    const scrollDirection = useScrollDirection()
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (scrollDirection === "down") {
            setIsVisible(false)
        } else if (scrollDirection === "up") {
            setIsVisible(true)
        }
    }, [scrollDirection])

    return { isVisible, scrollDirection }
}
