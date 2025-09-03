"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface DishcoveryCameraProps {
    onPhotoCaptured: (photo: CapturedPhoto) => void
    onBack: () => void
}

interface CapturedPhoto {
    id: string
    dataUrl: string
    file: File
}

export function DishcoveryCamera({ onPhotoCaptured, onBack }: DishcoveryCameraProps) {
    const [photo, setPhoto] = useState<CapturedPhoto | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showFlash, setShowFlash] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

                const file = new File([blob], `dishcovery-photo-${Date.now()}.jpg`, {
                    type: "image/jpeg",
                })
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8)

                const newPhoto: CapturedPhoto = {
                    id: `photo-${Date.now()}`,
                    dataUrl,
                    file,
                }

                setPhoto(newPhoto)
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
        if (!files || files.length === 0) return

        const file = files[0]

        // Validate file type
        const supportedTypes = ["image/png", "image/jpeg", "image/webp", "image/avif"]
        if (!supportedTypes.includes(file.type)) {
            setError(
                "Dit afbeeldingsformaat wordt niet ondersteund. Ondersteunde formaten: PNG, JPEG, WebP, AVIF. Probeer een screenshot te maken met je telefoon."
            )
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            if (!dataUrl) return

            const newPhoto: CapturedPhoto = {
                id: `gallery-${Date.now()}-${Math.random()}`,
                dataUrl,
                file,
            }

            setPhoto(newPhoto)
        }
        reader.readAsDataURL(file)

        // Reset input
        event.target.value = ""
    }

    const retakePhoto = () => {
        setPhoto(null)
        setError(null)
    }

    const continueToDescription = () => {
        if (photo) {
            setIsLoading(true)
            // Small delay to show loading state
            setTimeout(() => {
                onPhotoCaptured(photo)
            }, 300)
        }
    }

    const overlayContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black"
            role="main"
            aria-label="Camera voor dishcovery foto maken"
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

            {/* Back button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="absolute top-4 left-4 z-40 text-white hover:bg-white/20"
                aria-label="Terug"
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="absolute top-16 right-2 left-2 z-40 rounded-lg bg-red-500 p-3 text-sm text-white sm:right-4 sm:left-4"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="ml-2 text-white hover:bg-white/20"
                        >
                            Sluiten
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                aria-label="Kies uit galerij"
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
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Photo preview overlay */}
                <AnimatePresence>
                    {photo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-30 bg-black"
                        >
                            <img
                                src={photo.dataUrl}
                                alt="Captured"
                                className="h-full w-full object-contain"
                            />

                            {/* Photo controls */}
                            <div className="absolute right-0 bottom-6 left-0 z-40 sm:bottom-8">
                                <div className="flex items-center justify-center gap-3 px-4 sm:gap-4 sm:px-8">
                                    <Button
                                        onClick={retakePhoto}
                                        variant="outline"
                                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                    >
                                        Opnieuw
                                    </Button>

                                    <Button
                                        onClick={continueToDescription}
                                        disabled={isLoading}
                                        className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Bezig...
                                            </div>
                                        ) : (
                                            "Doorgaan"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom controls - only show when no photo is captured */}
                {!photo && (
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

                            {/* Camera capture button - truly centered */}
                            <div className="flex flex-1 justify-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={capturePhoto}
                                    disabled={!!error}
                                    className="h-14 w-14 rounded-full border-2 border-orange-200 bg-orange-100 text-orange-800 shadow-lg hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16 sm:w-16"
                                    aria-label="Foto maken"
                                >
                                    <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                                </Button>
                            </div>

                            {/* Empty space for balance */}
                            <div className="w-12 sm:w-16"></div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )

    return overlayContent
}
