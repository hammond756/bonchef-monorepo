"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

export function useNavigationVisibility() {
  const [isScrolling, setIsScrolling] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up")

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY

    if (currentScrollY > lastScrollY && currentScrollY > 10) {
      setScrollDirection("down")
    } else if (currentScrollY < lastScrollY) {
      setScrollDirection("up")
    }

    setLastScrollY(currentScrollY)
    setIsScrolling(true)
  }, [lastScrollY])

  useEffect(() => {
    if (typeof window === "undefined") return

    let scrollTimer: NodeJS.Timeout

    const onScroll = () => {
      handleScroll()
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      clearTimeout(scrollTimer)
    }
  }, [handleScroll])

  const shouldHideNavigation = useMemo(() => {
    if (typeof window === "undefined") return false

    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const distanceFromBottom = documentHeight - (lastScrollY + windowHeight)

    const bottomThreshold = window.innerWidth <= 768 ? 150 : 100
    const isNearBottom = distanceFromBottom <= bottomThreshold

    const hasEnoughContent = documentHeight > windowHeight + 200

    return (
      isScrolling &&
      scrollDirection === "down" &&
      lastScrollY > 10 &&
      !isNearBottom &&
      hasEnoughContent
    )
  }, [isScrolling, scrollDirection, lastScrollY])

  return shouldHideNavigation
} 