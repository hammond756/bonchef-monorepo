"use client"

import { useState, useEffect, useRef } from "react"

type ScrollDirection = "up" | "down" | null

/**
 * A custom React hook to detect the vertical scroll direction ('up' | 'down').
 *
 * This hook is designed to work exclusively with window-level scroll events, making it ideal
 * for implementing features like auto-hiding navigation bars that react to full-page scrolling.
 *
 * @param {number} [threshold=20] - The minimum scroll distance in pixels required to trigger a direction change. This prevents the hook from firing on minor scroll movements.
 *
 * @returns {'up' | 'down' | null} The current scroll direction. It returns `null` on the initial render and then updates to 'up' or 'down' based on user scrolling.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const scrollDirection = useScrollDirection();
 *
 *   useEffect(() => {
 *     if (scrollDirection === 'down') {
 *       // Logic for scrolling down
 *     } else if (scrollDirection === 'up') {
 *       // Logic for scrolling up
 *     }
 *   }, [scrollDirection]);
 *
 *   return <div>...</div>;
 * };
 * ```
 *
 * @assumptions
 * - It only tracks vertical scrolling on the global `window` object.
 * - It must be used within a client-side component (marked with `"use client"`).
 */
export function useScrollDirection(threshold = 20): ScrollDirection {
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
    const lastScrollY = useRef(0)

    useEffect(() => {
        lastScrollY.current = window.scrollY

        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const notScrolling = Math.abs(currentScrollY - lastScrollY.current) < threshold
            const atTheTop = currentScrollY <= 0
            if (notScrolling || atTheTop) {
                setScrollDirection(null)
                return
            }
            setScrollDirection(currentScrollY > lastScrollY.current ? "down" : "up")
            lastScrollY.current = currentScrollY
        }

        const onScroll = () => {
            window.requestAnimationFrame(handleScroll)
        }

        window.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            window.removeEventListener("scroll", onScroll)
        }
    }, [threshold])

    return scrollDirection
}
