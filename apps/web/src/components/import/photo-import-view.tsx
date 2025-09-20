"use client"

import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { StorageService } from "@/lib/services/storage-service"
import { createClient } from "@/utils/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { CameraView } from "../ui/camera-view"
import { CloseButton } from "../ui/close-button"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"

interface PhotoImportViewProps {
    onDismiss: () => void
    onSubmit: () => void
}

interface CapturedPhoto {
    id: string
    dataUrl: string
    file: File
}

async function uploadImageToSignedUrl(file: File): Promise<string> {
    const supabase = await createClient()
    const filePath = `${uuidv4()}.${file.name.split(".").pop()}`
    const storageService = new StorageService(supabase)
    return await storageService.uploadImage("recipe-images", file, true, filePath)
}

export function PhotoImportView({ onDismiss, onSubmit }: PhotoImportViewProps) {
    const [photo, setPhoto] = useState<CapturedPhoto | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { addJob } = useRecipeImportJobs()
    const { setIsVisible } = useNavigationVisibility()

    const openGallery = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            const newPhoto: CapturedPhoto = {
                id: `photo-${Date.now()}`,
                dataUrl,
                file,
            }
            setPhoto(newPhoto)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        if (!photo) return

        setError(null)

        try {
            // Upload all photos
            const imageUrl = await uploadImageToSignedUrl(photo.file)

            await addJob("image", imageUrl)

            // Hide navigation and submit
            setIsVisible(false)
            onSubmit()
        } catch (err) {
            console.error("Failed to process photos:", err)
            setError(
                err instanceof Error
                    ? err.message
                    : "Er ging iets mis bij het verwerken van de foto's"
            )
        }
    }

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black"
            >
                {/* Header */}
                <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between p-4">
                    <CloseButton onClick={onDismiss} />
                    <h2 className="text-lg font-semibold text-white">Kookboek scannen</h2>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <CameraView
                    onPhotoCaptured={(newPhoto) => setPhoto(newPhoto)}
                    onError={setError}
                    onOpenGallery={openGallery}
                    className="h-full"
                    showPreview={true}
                    onUsePhoto={handleSubmit}
                />

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute top-20 right-4 left-4 z-40"
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

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </motion.div>
        </AnimatePresence>,
        document.body
    )
}
