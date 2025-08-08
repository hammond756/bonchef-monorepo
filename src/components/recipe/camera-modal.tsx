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
    const [photos, setPhotos] = useState<CapturedPhoto[]>([])
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

                setPhotos([newPhoto]) // Replace any existing photos
                setShowFullscreenPhoto(true) // Show fullscreen immediately
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

        const file = files[0] // Take only the first file
        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            const newPhoto: CapturedPhoto = {
                id: `photo-${Date.now()}`,
                dataUrl,
                file,
            }
            setPhotos([newPhoto]) // Replace any existing photos
            setShowFullscreenPhoto(true) // Show fullscreen immediately
        }
        reader.readAsDataURL(file)
    }

    const retakePhoto = () => {
        setPhotos([])
        setShowFullscreenPhoto(false)
    }

    const usePhoto = useCallback(
        (photo: CapturedPhoto) => {
            onPhotoCaptured(photo.file)
            onClose()
            setPhotos([])
            setShowFullscreenPhoto(false)
        },
        [onPhotoCaptured, onClose]
    )

    if (!isOpen) return null

    // Show fullscreen photo if captured
    if (showFullscreenPhoto && photos.length > 0) {
        const photo = photos[0]
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black"
                >
                    {/* Header */}
                    <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-black/50 p-4 backdrop-blur-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <h2 className="text-lg font-semibold text-white">Foto bekijken</h2>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>

                    {/* Fullscreen Photo */}
                    <div className="relative h-full w-full">
                        <img
                            src={photo.dataUrl}
                            alt="Captured photo"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                onClick={retakePhoto}
                                variant="outline"
                                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                            >
                                Opnieuw maken
                            </Button>

                            <Button
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                onClick={() => usePhoto(photo)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Gebruik foto
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black"
            >
                {/* Header */}
                <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-black/50 p-4 backdrop-blur-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold text-white">Foto maken</h2>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

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

                    {/* Flash effect */}
                    {showFlash && <div className="absolute inset-0 bg-white opacity-80" />}
                </div>

                {/* Bottom controls */}
                <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={openGallery}
                            variant="outline"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Galerij
                        </Button>

                        <Button
                            onClick={capturePhoto}
                            size="lg"
                            className="h-16 w-16 rounded-full bg-white p-0 hover:bg-gray-100"
                            disabled={!!error}
                        >
                            <Camera className="h-8 w-8 text-black" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
