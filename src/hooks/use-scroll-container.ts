import { useCallback, useEffect, useRef, useState } from "react"

interface UseScrollContainerReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  showScrollButton: boolean
  scrollToBottom: () => void
  checkScrollPosition: () => void
}

export function useScrollContainer(): UseScrollContainerReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50
    setShowScrollButton(!isAtBottom)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    checkScrollPosition()

    container.addEventListener("scroll", checkScrollPosition)
    return () => container.removeEventListener("scroll", checkScrollPosition)
  }, [checkScrollPosition])

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [])

  return {
    containerRef,
    showScrollButton,
    scrollToBottom,
    checkScrollPosition
  }
} 