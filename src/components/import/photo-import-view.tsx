"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Camera, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { getSignedUploadUrl, startRecipeImportJob } from "@/actions/recipe-imports"
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
    const { path, token } = await getSignedUploadUrl(filePath)
    const storageService = new StorageService(supabase)
    return await storageService.uploadToSignedUrl("recipe-images", path, file, token)
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
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError") {
                        setError(
                            "Camera toegang geweigerd. Sta camera toegang toe in je browser instellingen."
                        )
                    } else if (err.name === "NotFoundError") {
                        setError("Geen camera gevonden op dit apparaat.")
                    } else {
                        setError(err.message)
                    }
                } else {
                    setError("Kon camera niet openen. Controleer je browser instellingen.")
                }
            }
        }

        initializeCamera()

        return () => {
            console.log("Stopping camera")
            mediaStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop())
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
        const files = event.target.files
        if (!files) return

        Array.from(files).forEach((file) => {
            // Validate file type
            if (!file.type.startsWith("image/")) return

            const reader = new FileReader()
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string
                if (!dataUrl) return

                const newPhoto: CapturedPhoto = {
                    id: `gallery-${Date.now()}-${Math.random()}`,
                    dataUrl,
                    file,
                }

                setPhotos((prev) => [...prev, newPhoto])
            }
            reader.readAsDataURL(file)
        })

        // Reset input
        event.target.value = ""
    }

    const removePhoto = (photoId: string) => {
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
    }

    const submitPhotos = async () => {
        if (photos.length === 0) {
            setError("Selecteer eerst een foto om te importeren.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Upload all photos as one import (multiple photos = one recipe)
            const formData = new FormData()

            // Add all photos to the same FormData
            photos.forEach((photo) => {
                formData.append("file", photo.file)
            })

            // TODO: add support for multiple photos
            const imageUrl = await uploadImageToSignedUrl(photos[0].file)

            await startRecipeImportJob("image", imageUrl, onboardingSessionId ?? undefined)

            // Immediately force navigation to be visible so user sees counter badge
            setIsVisible(true)

            setTimeout(() => {
                onSubmit()

                // Reset state
                setPhotos([])
            }, 300)
        } catch (error) {
            console.error("Failed to submit photos:", error)
            setError(
                error instanceof Error ? error.message : "Er is iets misgegaan bij het importeren."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const overlayContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black"
        >
            {/* Flash effect */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0 z-50 bg-white"
                    />
                )}
            </AnimatePresence>

            {/* Close button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="absolute top-4 right-4 z-40 text-white hover:bg-white/20"
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Error message */}
            {error && (
                <div className="absolute top-16 right-4 left-4 z-40 rounded-lg bg-red-500 p-3 text-sm text-white">
                    {error}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="ml-2 text-white hover:bg-white/20"
                    >
                        Sluiten
                    </Button>
                </div>
            )}

            {/* Camera view or fallback */}
            <div className="relative h-full w-full">
                {!error ? (
                    <>
                        <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            playsInline
                            muted
                        />

                        {/* Hidden canvas for photo capture */}
                        <canvas ref={canvasRef} className="hidden" />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-900">
                        <div className="text-center text-white">
                            <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
                            <p className="mb-4 text-lg">Camera niet beschikbaar</p>
                            <Button
                                onClick={openGallery}
                                variant="outline"
                                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Kies uit galerij
                            </Button>
                        </div>
                    </div>
                )}

                {/* Hidden file input for gallery */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Thumbnail strip */}
                {photos.length > 0 && (
                    <div className="absolute top-4 right-4 left-4 z-30">
                        <div className="flex gap-3 overflow-x-auto pr-2 pb-2">
                            {photos.map((photo) => (
                                <div key={photo.id} className="relative flex-shrink-0">
                                    <img
                                        src={photo.dataUrl}
                                        alt="Captured"
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePhoto(photo.id)}
                                        className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 p-0 text-white hover:bg-red-600"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom controls */}
                <div className="absolute right-0 bottom-8 left-0 z-30">
                    <div className="flex items-center justify-center px-8">
                        {/* Gallery button - fixed width */}
                        <div className="flex w-16 justify-start">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={openGallery}
                                className="h-12 w-12 border border-blue-200 bg-blue-100 text-blue-800 shadow-sm hover:bg-blue-200"
                            >
                                <ImageIcon className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Camera capture button - truly centered */}
                        <div className="flex flex-1 justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={capturePhoto}
                                disabled={!!error}
                                className="h-16 w-16 rounded-full border-2 border-orange-200 bg-orange-100 text-orange-800 shadow-lg hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Camera className="h-8 w-8" />
                            </Button>
                        </div>

                        {/* Submit button - fixed width */}
                        <div className="flex w-16 justify-end">
                            <Button
                                onClick={submitPhotos}
                                disabled={photos.length === 0 || isLoading}
                                className="h-12 border border-green-200 bg-green-100 px-4 text-sm font-semibold text-green-800 shadow-sm hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        <span className="hidden">Bezig...</span>
                                    </div>
                                ) : (
                                    "bonchef!"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )

    // Use createPortal to render outside the tab-bar container
    return typeof document !== "undefined" ? createPortal(overlayContent, document.body) : null
}
