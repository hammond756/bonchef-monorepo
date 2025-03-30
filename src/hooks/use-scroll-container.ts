import { useEffect, useRef, useState } from "react"

interface UseScrollContainerProps {
  dependencies?: unknown[]
}

interface UseScrollContainerReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  showScrollButton: boolean
  scrollToBottom: () => void
}

export function useScrollContainer({ dependencies = [] }: UseScrollContainerProps = {}): UseScrollContainerReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  function handleScroll(container: HTMLDivElement) {
    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50
    setShowScrollButton(!isAtBottom)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    handleScroll(container)
  }, dependencies)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", () => handleScroll(container))
    return () => container.removeEventListener("scroll", () => handleScroll(container))
  }, [])

  function scrollToBottom() {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth"
    })
  }

  return {
    containerRef,
    showScrollButton,
    scrollToBottom
  }
} 