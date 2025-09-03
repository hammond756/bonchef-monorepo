"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Camera, Image as ImageIcon, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { startRecipeImportJob } from "@/actions/recipe-imports"
import { StorageService } from "@/lib/services/storage-service"
import { createClient } from "@/utils/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { useOnboarding } from "@/hooks/use-onboarding"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"

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
    const [photos, setPhotos] = useState<CapturedPhoto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showFlash, setShowFlash] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { onboardingSessionId } = useOnboarding()
    const { setIsVisible } = useNavigationVisibility()

    useEffect(() => {
        let mediaStream: MediaStream | null = null

        async function initializeCamera() {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error(
                        "Camera is niet beschikbaar in deze browser of context. Probeer HTTPS of een andere browser."
                    )
                }

                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                })

                setError(null)

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                    videoRef.current.play()
                }
            } catch (err) {
                console.error("Failed to initialize camera:", err)
                const errorMessage =
                    err instanceof Error ? err.message : "Camera kon niet worden geïnitialiseerd"
                setError(errorMessage)
            }
        }

        initializeCamera()

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            }
        }
    }, [])

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (!context) return

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Show flash effect
        setShowFlash(true)
        setTimeout(() => setShowFlash(false), 100)

        // Convert to blob and create file
        canvas.toBlob(
            (blob) => {
                if (!blob) return

                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8)

                const newPhoto: CapturedPhoto = {
                    id: `photo-${Date.now()}`,
                    dataUrl,
                    file,
                }

                setPhotos((prev) => [...prev, newPhoto])
            },
            "image/jpeg",
            0.8
        )
    }, [])

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
            setPhotos((prev) => [...prev, newPhoto])
        }
        reader.readAsDataURL(file)
    }

    const removePhoto = (photoId: string) => {
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
    }

    const handleSubmit = async () => {
        if (photos.length === 0) return

        setIsLoading(true)
        setError(null)

        try {
            // Upload all photos
            const imageUrls = await Promise.all(
                photos.map((photo) => uploadImageToSignedUrl(photo.file))
            )

            // Start the recipe import job with all images
            const importData = JSON.stringify({
                imageUrls,
                source: "photo_import",
                onboardingSessionId,
            })

            await startRecipeImportJob("image", importData)

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
        } finally {
            setIsLoading(false)
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDismiss}
                        className="h-10 w-10 text-white hover:bg-white/20"
                        aria-label="Sluiten"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold text-white">Foto&apos;s importeren</h2>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Camera area */}
                <div className="h-full pt-16">
                    <div className="relative h-full w-full overflow-hidden">
                        {/* Video stream */}
                        <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            playsInline
                            muted
                            autoPlay
                        />

                        {/* Hidden canvas for photo capture */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Flash effect */}
                        <AnimatePresence>
                            {showFlash && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="absolute inset-0 bg-white"
                                />
                            )}
                        </AnimatePresence>

                        {/* Thumbnail strip - semi-transparent overlay */}
                        {photos.length > 0 && (
                            <div className="absolute top-4 right-4 left-4 z-30">
                                <div className="rounded-lg bg-black/50 p-2 backdrop-blur-sm">
                                    <div className="flex gap-2 overflow-x-auto">
                                        {photos.map((photo) => (
                                            <div key={photo.id} className="relative flex-shrink-0">
                                                <img
                                                    src={photo.dataUrl}
                                                    alt="Captured photo"
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                                <button
                                                    onClick={() => removePhoto(photo.id)}
                                                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Camera controls */}
                        <div className="absolute right-0 bottom-6 left-0 z-30 sm:bottom-8">
                            <div className="flex items-center justify-center px-4 sm:px-8">
                                {/* Gallery button - fixed width */}
                                <div className="flex w-12 justify-start sm:w-16">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={openGallery}
                                        className="h-10 w-10 border border-blue-200 bg-blue-100 text-blue-800 shadow-sm hover:bg-blue-200 sm:h-12 sm:w-12"
                                        aria-label="Galerij"
                                    >
                                        <ImageIcon className="h-6 w-6" />
                                    </Button>
                                </div>

                                {/* Capture button - centered */}
                                <div className="flex flex-1 justify-center">
                                    <Button
                                        onClick={capturePhoto}
                                        className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-lg hover:bg-gray-50 sm:h-20 sm:w-20"
                                        aria-label="Foto maken"
                                    >
                                        <Camera className="h-8 w-8 text-gray-800 sm:h-10 sm:w-10" />
                                    </Button>
                                </div>

                                {/* Bonchef button - fixed width */}
                                <div className="flex w-12 justify-end sm:w-16">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={photos.length === 0 || isLoading}
                                        className="h-10 w-10 bg-green-600 text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400 sm:h-12 sm:w-12"
                                        aria-label="bonchef!"
                                    >
                                        <Save className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
