"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useImportStatusStore } from "@/lib/store/import-status-store"

interface ImportPopupBaseProps {
    title: string
    description?: string
    isLoading: boolean
    children: React.ReactNode
    onSubmit: () => void
    error: string | null
    onClose: () => void
}

export function ImportPopupBase({
    title,
    description,
    isLoading,
    children,
    onSubmit,
    error,
    onClose,
}: Readonly<ImportPopupBaseProps>) {
    const { isAnimatingToCollection } = useImportStatusStore()

    const getAnimationVariants = () => {
        if (!isAnimatingToCollection) {
            return {
                initial: { scale: 0.9, y: 20, opacity: 0 },
                animate: { scale: 1, y: 0, opacity: 1 },
                exit: { scale: 0.9, y: 20, opacity: 0 },
            }
        }

        const collectionIconPosition = {
            x: window.innerWidth - 80,
            y: window.innerHeight - 80,
        }

        return {
            initial: { scale: 0.9, y: 20, opacity: 0 },
            animate: { scale: 1, y: 0, opacity: 1 },
            exit: {
                x: collectionIconPosition.x - window.innerWidth / 2,
                y: collectionIconPosition.y - window.innerHeight / 2,
                scale: 0.2,
                opacity: 0,
            },
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 grid h-screen place-items-center bg-black/30 px-6 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    variants={getAnimationVariants()}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        opacity: isAnimatingToCollection
                            ? { delay: 0.2, duration: 0.1 }
                            : undefined,
                    }}
                    className="bg-surface relative w-full max-w-md rounded-2xl p-6 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            disabled={isLoading}
                            aria-label="Sluiten"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    {description && (
                        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
                    )}
                    <div className="space-y-4">
                        {children}
                        {error && (
                            <p className="text-sm whitespace-pre-line text-red-500">{error}</p>
                        )}
                        <Button
                            onClick={onSubmit}
                            className="w-full"
                            disabled={isLoading}
                            aria-label="Importeren"
                        >
                            {isLoading ? "Bezig..." : "bonchef!"}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
