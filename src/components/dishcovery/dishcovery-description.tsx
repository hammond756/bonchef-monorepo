"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mic, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

interface DishcoveryDescriptionProps {
    photo: {
        id: string
        dataUrl: string
        file: File
    }
    onBack: () => void
    onContinue: (description: string) => void
}

interface VoiceState {
    isRecording: boolean
    audioBlob: Blob | null
}

export function DishcoveryDescription({
    photo,
    onBack,
    onContinue,
}: Readonly<DishcoveryDescriptionProps>) {
    const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isRecording: false,
        audioBlob: null,
    })
    const [textInput, setTextInput] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const hasStartedRecordingRef = useRef(false)

    // Simple validation logic
    const hasValidInput =
        inputMode === "voice" ? voiceState.audioBlob : textInput.trim().length >= 3
    const canProceed = hasValidInput && !isProcessing

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Try to use a more widely supported audio format
            let mimeType = "audio/webm;codecs=opus"
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = "audio/mp4"
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = "audio/wav"
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
            })

            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
                    setVoiceState((prev) => ({ ...prev, audioBlob, isRecording: false }))
                    // Clean up stream tracks
                    stream.getTracks().forEach((track) => track.stop())
                } catch (error) {
                    console.error("Error creating audio blob:", error)
                    setError("Er ging iets mis bij het verwerken van de opname.")
                }
            }

            mediaRecorder.start()
            setVoiceState((prev) => ({ ...prev, isRecording: true }))
        } catch (error) {
            console.error("Failed to start recording:", error)
            setError("Kon microfoon niet starten. Controleer je permissies.")
        }
    }, [setError])

    // Auto-start microphone when component mounts (only once)
    useEffect(() => {
        if (inputMode === "voice" && !hasStartedRecordingRef.current) {
            hasStartedRecordingRef.current = true
            startRecording()
        }
    }, [inputMode]) // Remove startRecording from dependencies

    // Reset recording state when inputMode changes
    useEffect(() => {
        hasStartedRecordingRef.current = false
    }, [inputMode])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && voiceState.isRecording) {
            mediaRecorderRef.current.stop()
            setVoiceState((prev) => ({ ...prev, isRecording: false }))
        }
    }, [voiceState.isRecording])

    const switchToTextMode = useCallback(() => {
        setInputMode("text")
        if (voiceState.isRecording) {
            stopRecording()
        }
        // Copy transcript to text input if available
        if (voiceState.audioBlob) {
            // For now, we'll just clear the audio when switching to text
            setVoiceState((prev) => ({ ...prev, audioBlob: null }))
        }
        // Reset recording state to allow starting again when switching back
        hasStartedRecordingRef.current = false
    }, [voiceState.isRecording, voiceState.audioBlob, stopRecording])

    const switchToVoiceMode = useCallback(() => {
        setInputMode("voice")
        setTextInput("")
        setVoiceState((prev) => ({ ...prev, audioBlob: null }))
        // Reset recording state to allow starting again
        hasStartedRecordingRef.current = false
    }, [])

    const handleContinue = useCallback(async () => {
        try {
            setIsProcessing(true)

            let description = ""
            let audioUrl = ""

            if (inputMode === "voice" && voiceState.audioBlob) {
                // Upload audio to Supabase storage
                // Transcription will happen in the background as part of the recipe import job
                try {
                    const { uploadAudio } = await import("@/actions/recipe-imports")
                    audioUrl = await uploadAudio(voiceState.audioBlob)
                    description = "" // Will be filled in by the background job
                } catch (error) {
                    console.error("Failed to upload audio:", error)
                    throw new Error("Failed to upload audio file")
                }
            } else {
                description = textInput
            }

            const trimmedDescription = description.trim()

            if (trimmedDescription.length >= 3 || (inputMode === "voice" && audioUrl)) {
                // Upload the photo to storage first to get a permanent URL
                const { uploadImage } = await import("@/actions/recipe-imports")
                const uploadedPhotoUrl = await uploadImage(photo.file)

                // Start the recipe import job
                const { startRecipeImportJob } = await import("@/actions/recipe-imports")
                const dishcoveryData = JSON.stringify({
                    photoUrl: uploadedPhotoUrl,
                    description: inputMode === "voice" ? "" : trimmedDescription, // Empty for voice, actual text for text mode
                    ...(inputMode === "voice" && audioUrl
                        ? {
                              audioUrl,
                          }
                        : {}),
                })

                console.log(`[DishcoveryDescription] Starting recipe import job for dishcovery`)

                // Start the recipe import job (this will create a DRAFT recipe)
                await startRecipeImportJob("dishcovery", dishcoveryData)

                // Reset processing state BEFORE calling onContinue
                setIsProcessing(false)

                // Call the original onContinue callback to navigate to collection page
                onContinue(inputMode === "voice" ? "Voice opname" : trimmedDescription)
            } else {
                const errorMessage = "Voeg minimaal 3 karakters toe om door te gaan."
                setError(errorMessage)
                setIsProcessing(false)
            }
        } catch (error) {
            console.error("[DishcoveryDescription] Failed to process:", error)
            setError("Er ging iets mis bij het verwerken van je input. Probeer het opnieuw.")
            setIsProcessing(false)
        }
    }, [
        inputMode,
        voiceState.audioBlob,
        textInput,
        onContinue,
        photo.file,
        setError,
        setIsProcessing,
    ])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="focus:bg-primary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:text-white"
            >
                Ga naar hoofdinhoud
            </a>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 flex-col"
                >
                    {/* Photo display - full width to top with back button overlay */}
                    <div className="relative w-full">
                        <div className="aspect-square w-full">
                            <img
                                src={photo.dataUrl}
                                alt="Captured dish"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Back button overlay on top of photo */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="absolute top-4 left-4 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-white/20"
                            aria-label="Terug"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Input section */}
                    <div
                        id="main-content"
                        className="bg-surface relative z-10 -mt-8 flex-1 p-4 sm:p-6"
                    >
                        {/* Title and subtitle */}
                        <div className="mb-4 text-center sm:mb-6">
                            <h1 className="text-text-default mb-2 text-xl font-semibold sm:text-2xl">
                                Vertel meer over dit gerecht
                            </h1>
                            <p
                                className="text-text-muted px-2 text-sm sm:text-base"
                                id="text-instructions"
                            >
                                Beschrijf ingrediënten, smaken, kruiden, en alles wat bijzonder is.
                            </p>
                        </div>

                        {/* Voice input mode */}
                        {inputMode === "voice" ? (
                            <div className="mb-6 text-center">
                                <div className="relative inline-flex items-center justify-center">
                                    {/* Pulsing sound wave bars to left and right when listening */}
                                    {voiceState.isRecording && (
                                        <>
                                            {/* Left side wave bars */}
                                            <div className="absolute top-1/2 left-0 flex -translate-x-8 -translate-y-1/2 flex-row items-center gap-1 sm:-translate-x-12">
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 16, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 20, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.2,
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 24, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.4,
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 20, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.6,
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 16, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.8,
                                                    }}
                                                />
                                            </div>

                                            {/* Right side wave bars */}
                                            <div className="absolute top-1/2 right-0 flex translate-x-8 -translate-y-1/2 flex-row items-center gap-1 sm:translate-x-12">
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 16, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 20, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.2,
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 24, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.4,
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 20, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.6,
                                                    }}
                                                />
                                                <motion.div
                                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                                    animate={{
                                                        height: [8, 16, 8],
                                                        opacity: [0.9, 0.4, 0.9],
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.8,
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Main microphone button */}
                                    <motion.div
                                        animate={
                                            voiceState.isRecording
                                                ? {
                                                      scale: [1, 1.08, 1],
                                                  }
                                                : {}
                                        }
                                        transition={{
                                            duration: 1.2,
                                            repeat: voiceState.isRecording ? Infinity : 0,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Button
                                            onClick={
                                                voiceState.isRecording
                                                    ? stopRecording
                                                    : startRecording
                                            }
                                            className={`relative z-10 h-16 w-16 rounded-full transition-all duration-300 sm:h-20 sm:w-20 ${
                                                voiceState.isRecording
                                                    ? "bg-[#b9e7ca] text-[#157f3d] shadow-lg hover:bg-[#a1ddb8]"
                                                    : "bg-[#385940] text-white hover:bg-[#2b2b2b]"
                                            }`}
                                            aria-label={
                                                voiceState.isRecording
                                                    ? "Stop opname"
                                                    : "Beginnen met spreken"
                                            }
                                        >
                                            <AnimatePresence mode="wait">
                                                {voiceState.isRecording ? (
                                                    <motion.div
                                                        key="recording"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="flex items-center justify-center"
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Mic className="h-8 w-8 text-white" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="not-recording"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="flex items-center justify-center"
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Mic className="h-6 w-6 sm:h-8 sm:w-8" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Button>
                                    </motion.div>
                                </div>

                                <p className="mt-2 text-sm text-gray-600">
                                    {voiceState.isRecording
                                        ? "Luisteren..."
                                        : "Tik om te beginnen met spreken"}
                                </p>

                                {/* "Ik kan nu niet praten" button */}
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="default"
                                        onClick={switchToTextMode}
                                        className="border-text-muted text-text-default h-10 hover:bg-gray-50 sm:h-9"
                                    >
                                        <Type className="mr-2 h-4 w-4" />
                                        Ik kan nu niet praten
                                    </Button>
                                </div>

                                {voiceState.audioBlob && (
                                    <div className="mt-4 rounded-lg bg-gray-100 p-3 text-left">
                                        <div className="max-h-[4.5rem] overflow-y-auto">
                                            <p className="text-sm leading-relaxed text-gray-800">
                                                ✅ Opname voltooid! Klik op Bonchef!! om door te
                                                gaan.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mb-6">
                                <Textarea
                                    value={textInput}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                        const value = e.target.value
                                        setTextInput(value)

                                        // Clear any previous errors when user types
                                        if (error) {
                                            setError(null)
                                        }
                                    }}
                                    placeholder="Beschrijf de ingrediënten, smaken, kruiden, en bereidingswijze die je ziet of weet..."
                                    className="min-h-[100px] resize-none border-gray-300 bg-white text-base text-gray-800 placeholder:text-gray-500 sm:min-h-[120px]"
                                    maxLength={500}
                                    aria-label="Beschrijving van het gerecht"
                                    aria-describedby="text-counter text-instructions"
                                />
                                <div
                                    id="text-counter"
                                    className="mt-2 text-right text-xs text-gray-500"
                                >
                                    {textInput.length}/500
                                </div>

                                {/* "Toch liever spreken" button */}
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="outline"
                                        size="default"
                                        onClick={switchToVoiceMode}
                                        className="border-text-muted text-text-default h-10 hover:bg-gray-50 sm:h-9"
                                    >
                                        <Mic className="mr-2 h-4 w-4" />
                                        Toch liever spreken
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="bg-status-red-bg border-status-red-border mb-4 rounded-lg border p-3"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    <p className="text-status-red-text text-sm">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Continue button */}
                        <div className="text-center">
                            <Button
                                onClick={handleContinue}
                                disabled={!canProceed}
                                className="bg-accent-new hover:bg-status-green-text disabled:bg-text-muted w-full text-white shadow-lg disabled:cursor-not-allowed"
                                size="lg"
                                aria-describedby={isProcessing ? "button-status" : undefined}
                            >
                                <AnimatePresence mode="wait">
                                    {isProcessing ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center"
                                        >
                                            <motion.div
                                                className="mr-2 h-5 w-5 rounded-full border-2 border-current border-t-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                            Bezig...
                                            <span id="button-status" className="sr-only">
                                                Recept wordt gegenereerd, even geduld
                                            </span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="ready"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center"
                                        >
                                            <span>Bonchef!!</span>
                                            <img
                                                src="/icons/ok-hand-white-med-svgrepo-com.svg"
                                                alt="OK"
                                                className="ml-2 h-7 w-7"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
