"use client"

import { createPortal } from "react-dom"
import { useEffect, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SlideInOverlayProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

export function SlideInOverlay({ isOpen, onClose, children }: Readonly<SlideInOverlayProps>) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Prevent body scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            // Store the original overflow value and scroll position
            const originalOverflow = document.body.style.overflow
            const originalPosition = document.body.style.position
            const originalTop = document.body.style.top
            const scrollY = window.scrollY

            // The overflow hidden and position fixed prevent scrolling, but
            // will also forget the scroll position, thus showing the content
            // from the top of the page.
            // We compensate for this by storing the scroll position, setting it
            // as the top-offset to simulate scroll in a fixed page
            document.body.style.overflow = "hidden"
            document.body.style.position = "fixed"
            document.body.style.top = `-${scrollY}px`
            document.body.style.width = "100%"

            // Cleanup function to restore original state
            return () => {
                document.body.style.overflow = originalOverflow
                document.body.style.position = originalPosition
                document.body.style.top = originalTop
                document.body.style.width = ""

                // IMPORTANT: use instant behavior to avoid flickering
                window.scrollTo({ top: scrollY, behavior: "instant" })
            }
        }
    }, [isOpen])

    if (!isMounted) return null

    const handleBackgroundClick = () => {
        onClose()
    }

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const overlayContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 z-40 bg-black/10" // z-40 to be below shadcn dialogs, but above top bar
                        onClick={handleBackgroundClick}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="bg-surface safe-area-bottom fixed right-0 bottom-0 left-0 z-50 transform rounded-t-2xl border border-gray-200 shadow-2xl"
                        onClick={handleContentClick}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )

    return createPortal(overlayContent, document.body)
}
