"use client"

import { Camera, FileText, Link as LinkIcon, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ImportMode } from "@/lib/types"

interface ImportOverlayProps {
    isOpen: boolean
    onClose: () => void
    onSelectMode: (mode: ImportMode) => void
}

export function ImportOverlay({ isOpen, onClose, onSelectMode }: ImportOverlayProps) {
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

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

    const handleChatClick = () => {
        onClose()
        router.push("/chat")
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
                        className="fixed inset-0 z-[99999] bg-black/10"
                        onClick={handleBackgroundClick}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="bg-surface safe-area-bottom fixed right-0 bottom-0 left-0 z-[99999] transform rounded-t-2xl border border-gray-200 p-4 shadow-2xl"
                        onClick={handleContentClick}
                    >
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-semibold">Recept importeren</h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 py-6">
                            <button
                                onClick={() => onSelectMode("photo")}
                                className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-orange-100 p-4 text-center text-orange-800 transition-colors hover:bg-orange-200"
                            >
                                <Camera className="h-8 w-8" />
                                <span className="text-sm font-medium">Foto</span>
                            </button>
                            <button
                                onClick={() => onSelectMode("url")}
                                className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-blue-100 p-4 text-center text-blue-800 transition-colors hover:bg-blue-200"
                            >
                                <LinkIcon className="h-8 w-8" />
                                <span className="text-sm font-medium">Website</span>
                            </button>
                            <button
                                onClick={() => onSelectMode("text")}
                                className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-purple-100 p-4 text-center text-purple-800 transition-colors hover:bg-purple-200"
                            >
                                <FileText className="h-8 w-8" />
                                <span className="text-sm font-medium">Notitie</span>
                            </button>
                        </div>
                        <div className="relative mb-6 flex items-center justify-center">
                            <span className="bg-surface text-muted-foreground z-10 px-2 text-sm">
                                of
                            </span>
                            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 border-t"></div>
                        </div>
                        <button
                            onClick={handleChatClick}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-100 p-4 text-center text-green-800 transition-colors hover:bg-green-200"
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Chat</span>
                        </button>

                        {/* Extra whitespace for better spacing */}
                        <div className="h-8"></div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )

    return createPortal(overlayContent, document.body)
}
