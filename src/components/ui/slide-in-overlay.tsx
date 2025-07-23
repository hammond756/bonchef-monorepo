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
