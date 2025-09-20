"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Camera, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface CameraModalProps {
    isOpen: boolean
    onClose: () => void
    onPhotoCaptured: (file: File) => void
}

interface CapturedPhoto {
    id: string
    dataUrl: string
    file: File
}

export function CameraModal({ isOpen, onClose, onPhotoCaptured }: CameraModalProps) {
    const [photo, setPhoto] = useState<CapturedPhoto | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showFlash, setShowFlash] = useState(false)
    const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!isOpen) return

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
    }, [isOpen])

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

                setPhoto(newPhoto)
                setShowFullscreenPhoto(true)
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
            setPhoto(newPhoto)
            setShowFullscreenPhoto(true)
        }
        reader.readAsDataURL(file)
    }

    const handleUsePhoto = () => {
        if (photo) {
            onPhotoCaptured(photo.file)
            onClose()
        }
    }

    const handleRetake = () => {
        setPhoto(null)
        setShowFullscreenPhoto(false)
        setError(null)
    }

    if (!isOpen) return null

    return (
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
                        onClick={onClose}
                        className="h-10 w-10 text-white hover:bg-white/20"
                        aria-label="Sluiten"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold text-white">Foto maken</h2>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Camera/Photo area */}
                <div className="h-full pt-16">
                    {!showFullscreenPhoto ? (
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

                                    {/* Spacer for balance */}
                                    <div className="w-12 sm:w-16" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-full">
                            <img
                                src={photo?.dataUrl}
                                alt="Captured photo"
                                className="h-full w-full object-cover"
                            />

                            {/* Photo overlay controls */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Subtle gradient overlay for better button visibility */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                                {/* Icon buttons with better visibility */}
                                <div className="relative flex gap-6">
                                    {/* Red X button for retake */}
                                    <button
                                        onClick={handleRetake}
                                        className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-500/90 text-white shadow-lg backdrop-blur-sm hover:bg-red-600"
                                        aria-label="Opnieuw"
                                    >
                                        <X className="h-8 w-8" />
                                    </button>

                                    {/* Green bonchef ok hand button */}
                                    <button
                                        onClick={handleUsePhoto}
                                        className="flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-600/90 text-white shadow-lg backdrop-blur-sm hover:bg-green-700"
                                        aria-label="Gebruiken"
                                    >
                                        <svg
                                            className="h-9 w-9"
                                            viewBox="0 0 25 25"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.2"
                                        >
                                            <path d="M15.9957 11.5C14.8197 10.912 11.9957 9 10.4957 9C8.9957 9 5.17825 11.7674 6 13C7 14.5 9.15134 11.7256 10.4957 12C11.8401 12.2744 13 13.5 13 14.5C13 15.5 11.8401 16.939 10.4957 16.5C9.15134 16.061 8.58665 14.3415 7.4957 14C6.21272 13.5984 5.05843 14.6168 5.5 15.5C5.94157 16.3832 7.10688 17.6006 8.4957 19C9.74229 20.2561 11.9957 21.5 14.9957 20C17.9957 18.5 18.5 16.2498 18.5 13C18.5 11.5 13.7332 5.36875 11.9957 4.5C10.9957 4 10 5 10.9957 6.5C11.614 7.43149 13.5 9.27705 14 10.3751M15.5 8C15.5 8 15.3707 7.5 14.9957 6C14.4957 4 15.9957 3.5 16.4957 4.5C17.1281 5.76491 18.2872 10.9147 18.4957 13" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
        </AnimatePresence>
    )
}
