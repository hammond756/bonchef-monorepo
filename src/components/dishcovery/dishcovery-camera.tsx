"use client"

import { useState, useRef } from "react"
import { CameraView } from "@/components/ui/camera-view"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { CloseButton } from "../ui/close-button"

interface DishcoveryCameraProps {
    onPhotoCaptured: (photo: CapturedPhoto) => void
}

interface CapturedPhoto {
    id: string
    dataUrl: string
    file: File
}

export function DishcoveryCamera({ onPhotoCaptured }: DishcoveryCameraProps) {
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handlePhotoCaptured = (capturedPhoto: CapturedPhoto) => {
        onPhotoCaptured(capturedPhoto)
    }

    const handleError = (errorMessage: string) => {
        setError(errorMessage)
    }

    const openGallery = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        const supportedTypes = ["image/png", "image/jpeg", "image/webp", "image/avif"]
        if (!supportedTypes.includes(file.type)) {
            setError(
                "Dit afbeeldingsformaat wordt niet ondersteund. Gebruik PNG, JPEG, WebP of AVIF."
            )
            return
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            setError("De afbeelding is te groot. Gebruik een afbeelding kleiner dan 10MB.")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            const newPhoto: CapturedPhoto = {
                id: `photo-${Date.now()}`,
                dataUrl,
                file,
            }
            onPhotoCaptured(newPhoto)
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between p-4">
                <CloseButton onClick={() => router.back()} />
                <h2 className="text-lg font-semibold text-white">Gerecht vastleggen</h2>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Camera/Photo area */}
            <div className="relative flex-1">
                <CameraView
                    onPhotoCaptured={handlePhotoCaptured}
                    onError={handleError}
                    onOpenGallery={openGallery}
                    className="h-full"
                    showPreview={true}
                />

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute top-4 right-4 left-4 z-40"
                        >
                            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                                <p className="text-sm">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-2 text-xs underline hover:no-underline"
                                >
                                    Sluiten
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    )
}
