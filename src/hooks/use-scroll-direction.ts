"use client"

import { useState, useEffect, useRef, RefObject } from "react"

type ScrollDirection = "up" | "down"

export function useScrollDirection(
    threshold = 10,
    targetRef?: RefObject<HTMLElement | null>
): ScrollDirection | null {
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection | null>(null)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const targetElement = targetRef?.current || window
        const getScrollY = () =>
            targetElement instanceof Window ? targetElement.scrollY : targetElement.scrollTop

        lastScrollY.current = getScrollY()

        const handleScroll = () => {
            const currentScrollY = getScrollY()
            if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
                return
            }
            setScrollDirection(currentScrollY > lastScrollY.current ? "down" : "up")
            lastScrollY.current = currentScrollY
        }

        const onScroll = () => {
            window.requestAnimationFrame(handleScroll)
        }

        targetElement.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            targetElement.removeEventListener("scroll", onScroll)
        }
    }, [threshold, targetRef])

    return scrollDirection
}
