"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ArrowLeft, Mic, Type, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useDishcovery } from "@/hooks/use-dishcovery"
import { startRecipeImportJob } from "@/actions/recipe-imports"

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
    isListening: boolean
    isPaused: boolean
    transcript: string
}

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
    length: number
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    length: number
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: ((event: Event) => void) | null
    start(): void
    stop(): void
    abort(): void
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
}

declare global {
    interface Window {
        webkitSpeechRecognition: new () => SpeechRecognition
        SpeechRecognition: new () => SpeechRecognition
    }
}

export function DishcoveryDescription({
    photo,
    onBack,
    onContinue,
}: Readonly<DishcoveryDescriptionProps>) {
    const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isListening: false,
        isPaused: false,
        transcript: "",
    })
    const [textInput, setTextInput] = useState("")

    const recognitionRef = useRef<SpeechRecognition | null>(null)

    // Use the dishcovery hook for state management
    const {
        state: dishcoveryState,
        setPhoto: setDishcoveryPhoto,
        setInput: setDishcoveryInput,
        setProcessing: setDishcoveryProcessing,
        setError: setDishcoveryError,
        canProceed: dishcoveryCanProceed,
    } = useDishcovery()

    // Set photo in dishcovery hook on mount
    useEffect(() => {
        setDishcoveryPhoto({
            id: photo.id,
            dataUrl: photo.dataUrl,
            file: photo.file,
        })
    }, [photo.id, photo.dataUrl, photo.file, setDishcoveryPhoto])

    // Initialize speech recognition and auto-start listening
    useEffect(() => {
        if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
            const SpeechRecognitionClass =
                window.webkitSpeechRecognition || window.SpeechRecognition
            recognitionRef.current = new SpeechRecognitionClass()

            const recognition = recognitionRef.current
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = "nl-NL" // Dutch language

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = ""

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript
                    }
                }

                // Only update if we have actual content (not just silence)
                if (finalTranscript.trim().length > 0) {
                    setVoiceState((prev) => ({
                        ...prev,
                        transcript: prev.transcript + finalTranscript,
                    }))
                }

                // Update the dishcovery hook with voice input
                const totalContent = (voiceState.transcript + finalTranscript).trim()
                if (totalContent.length > 0) {
                    const isValid = totalContent.length >= 3
                    setDishcoveryInput({
                        type: "voice",
                        content: totalContent,
                        isValid,
                    })

                    // Clear any previous errors when valid voice input is received
                    if (isValid && dishcoveryState.error) {
                        setDishcoveryError(null)
                    }
                }
            }

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error:", event.error)
                // Reset state on any error
                setVoiceState((prev) => ({ ...prev, isListening: false, isPaused: false }))

                // Set error message based on error type
                if (event.error === "not-allowed") {
                    setDishcoveryError(
                        "Microfoon toegang geweigerd. Geef toestemming om je microfoon te gebruiken."
                    )
                } else if (event.error === "no-speech") {
                    setDishcoveryError("Geen spraak gedetecteerd. Probeer het opnieuw.")
                } else {
                    setDishcoveryError(
                        "Er ging iets mis met de spraakherkenning. Probeer het opnieuw."
                    )
                }
            }

            recognition.onend = () => {
                // Speech recognition ended naturally, reset listening state
                setVoiceState((prev) => ({ ...prev, isListening: false }))
            }
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop()
                } catch (error) {
                    console.error("Error stopping speech recognition on cleanup:", error)
                }
            }
        }
    }, [])

    // Auto-start listening when component mounts in voice mode
    useEffect(() => {
        if (recognitionRef.current && inputMode === "voice") {
            const autoStartTimer = setTimeout(() => {
                if (!voiceState.isListening) {
                    try {
                        recognitionRef.current!.start()
                        setVoiceState((prev) => ({ ...prev, isListening: true, isPaused: false }))
                    } catch (error) {
                        console.error("Failed to auto-start speech recognition:", error)
                    }
                }
            }, 1000) // Delay to ensure recognition is fully initialized

            return () => {
                clearTimeout(autoStartTimer)
            }
        }
    }, [inputMode]) // Remove voiceState.isListening dependency to prevent conflicts

    const startListening = useCallback(() => {
        if (recognitionRef.current && !voiceState.isListening) {
            try {
                // First stop any existing recognition to prevent conflicts
                recognitionRef.current.stop()
                // Small delay to ensure clean state
                setTimeout(() => {
                    if (recognitionRef.current) {
                        recognitionRef.current.start()
                        setVoiceState((prev) => ({ ...prev, isListening: true, isPaused: false }))
                    }
                }, 100)
            } catch (error) {
                console.error("Failed to start speech recognition:", error)
                // If start fails, reset state
                setVoiceState((prev) => ({ ...prev, isListening: false, isPaused: false }))
            }
        }
    }, [voiceState.isListening])

    const pauseListening = useCallback(() => {
        if (recognitionRef.current && voiceState.isListening) {
            try {
                recognitionRef.current.stop()
                setVoiceState((prev) => ({ ...prev, isListening: false, isPaused: false }))
            } catch (error) {
                console.error("Failed to stop speech recognition:", error)
                // If stop fails, reset state
                setVoiceState((prev) => ({ ...prev, isListening: false, isPaused: false }))
            }
        }
    }, [voiceState.isListening])

    const toggleVoiceInput = useCallback(() => {
        if (voiceState.isListening) {
            pauseListening()
        } else {
            // Either start fresh or resume from pause
            startListening()
        }
    }, [voiceState.isListening, startListening, pauseListening])

    const switchToTextMode = useCallback(() => {
        setInputMode("text")
        if (voiceState.isListening) {
            pauseListening()
        }
        // Copy transcript to text input if available
        if (voiceState.transcript.trim()) {
            const transcriptText = voiceState.transcript.trim()
            setTextInput(transcriptText)
            // Update dishcovery input with the transcript
            const isValid = transcriptText.length >= 3
            setDishcoveryInput({
                type: "text",
                content: transcriptText,
                isValid,
            })
        }
    }, [voiceState.isListening, voiceState.transcript, pauseListening, setDishcoveryInput])

    const switchToVoiceMode = useCallback(() => {
        setInputMode("voice")
        // Don't clear text input, keep it for potential fallback
        // Update dishcovery input with current text if available
        if (textInput.trim()) {
            const isValid = textInput.trim().length >= 3
            setDishcoveryInput({
                type: "text",
                content: textInput.trim(),
                isValid,
            })
        }
    }, [textInput, setDishcoveryInput])

    const handleContinue = useCallback(async () => {
        const description = inputMode === "voice" ? voiceState.transcript : textInput
        const trimmedDescription = description.trim()

        if (trimmedDescription.length >= 3) {
            try {
                setDishcoveryProcessing(true)

                // Upload the photo to storage first to get a permanent URL
                const { uploadImage } = await import("@/actions/recipe-imports")
                const uploadedPhotoUrl = await uploadImage(photo.file)

                // Create dishcovery data with uploaded photo URL and description
                const dishcoveryData = JSON.stringify({
                    photoUrl: uploadedPhotoUrl,
                    description: trimmedDescription,
                })

                // Start the recipe import job
                const jobId = await startRecipeImportJob("dishcovery", dishcoveryData)
                console.log(`[DishcoveryDescription] Started recipe import job: ${jobId}`)

                // Call the original onContinue callback
                onContinue(trimmedDescription)
            } catch (error) {
                console.error("[DishcoveryDescription] Failed to start recipe import job:", error)
                setDishcoveryError(
                    "Er ging iets mis bij het starten van de recept generatie. Probeer het opnieuw."
                )
                setDishcoveryProcessing(false)
            }
        } else {
            const errorMessage =
                inputMode === "voice"
                    ? "Voeg minimaal 3 karakters toe via spraak om door te gaan."
                    : "Voeg minimaal 3 karakters toe via tekst om door te gaan."
            setDishcoveryError(errorMessage)
        }
    }, [
        inputMode,
        voiceState.transcript,
        textInput,
        onContinue,
        setDishcoveryProcessing,
        setDishcoveryError,
        photo.file,
    ])

    // Use dishcovery hook for complete validation (photo + input)
    const hasValidInput = dishcoveryCanProceed

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
                                id="text-instructions"
                                className="text-text-muted px-2 text-sm sm:text-base"
                            >
                                Beschrijf ingrediënten, smaken, kruiden, en alles wat bijzonder is.
                            </p>
                        </div>

                        {/* Voice input mode */}
                        {inputMode === "voice" && (
                            <div className="mb-6 text-center">
                                <div className="relative inline-flex items-center justify-center">
                                    {/* Pulsing sound wave bars to left and right when listening */}
                                    {voiceState.isListening && (
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
                                                    className="h-2 w-1 rounded-full bg-green-500"
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
                                                    className="h-2 w-1 rounded-full bg-green-500"
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
                                            voiceState.isListening
                                                ? {
                                                      scale: [1, 1.08, 1],
                                                  }
                                                : {}
                                        }
                                        transition={{
                                            duration: 1.2,
                                            repeat: voiceState.isListening ? Infinity : 0,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Button
                                            onClick={toggleVoiceInput}
                                            className={`relative z-10 h-16 w-16 rounded-full transition-all duration-300 sm:h-20 sm:w-20 ${
                                                voiceState.isListening
                                                    ? "bg-[#b9e7ca] text-[#157f3d] shadow-lg hover:bg-[#a1ddb8]"
                                                    : "bg-[#385940] text-white hover:bg-[#2b2b2b]"
                                            }`}
                                            aria-label={
                                                voiceState.isListening
                                                    ? "Pauzeren"
                                                    : "Beginnen met spreken"
                                            }
                                        >
                                            <AnimatePresence mode="wait">
                                                {voiceState.isListening ? (
                                                    <motion.div
                                                        key="listening"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="flex items-center justify-center"
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Volume2 className="h-8 w-8 text-white" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="not-listening"
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
                                    {voiceState.isListening
                                        ? "Luisteren..."
                                        : voiceState.isPaused
                                          ? "Tik om te beginnen met spreken"
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

                                {voiceState.transcript && (
                                    <div className="mt-4 rounded-lg bg-gray-100 p-3 text-left">
                                        <div className="max-h-[4.5rem] overflow-y-auto">
                                            <p className="text-sm leading-relaxed text-gray-800">
                                                {voiceState.transcript}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Text input mode */}
                        {inputMode === "text" && (
                            <div className="mb-6">
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setTextInput(value)

                                        // Update the dishcovery hook with text input
                                        const trimmedValue = value.trim()
                                        const isValid = trimmedValue.length >= 3

                                        setDishcoveryInput({
                                            type: "text",
                                            content: trimmedValue,
                                            isValid,
                                        })

                                        // Clear any previous errors when user types
                                        if (isValid && dishcoveryState.error) {
                                            setDishcoveryError(null)
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
                            {dishcoveryState.error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="bg-status-red-bg border-status-red-border mb-4 rounded-lg border p-3"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    <p className="text-status-red-text text-sm">
                                        {dishcoveryState.error}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Continue button */}
                        <div className="text-center">
                            <Button
                                onClick={handleContinue}
                                disabled={!hasValidInput || dishcoveryState.isProcessing}
                                className="bg-accent-new hover:bg-status-green-text disabled:bg-text-muted w-full text-white shadow-lg disabled:cursor-not-allowed"
                                size="lg"
                                aria-describedby={
                                    dishcoveryState.isProcessing ? "button-status" : undefined
                                }
                            >
                                <AnimatePresence mode="wait">
                                    {dishcoveryState.isProcessing ? (
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
                                            <svg
                                                className="mr-2 h-5 w-5"
                                                viewBox="0 0 25 25"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.2"
                                            >
                                                <path d="M15.9957 11.5C14.8197 10.912 11.9957 9 10.4957 9C8.9957 9 5.17825 11.7674 6 13C7 14.5 9.15134 11.7256 10.4957 12C11.8401 12.2744 13 13.5 13 14.5C13 15.5 11.8401 16.939 10.4957 16.5C9.15134 16.061 8.58665 14.3415 7.4957 14C6.21272 13.5984 5.05843 14.6168 5.5 15.5C5.94157 16.3832 7.10688 17.6006 8.4957 19C9.74229 20.2561 11.9957 21.5 14.9957 20C17.9957 18.5 18.5 16.2498 18.5 13C18.5 11.5 13.7332 5.36875 11.9957 4.5C10.9957 4 10 5 10.9957 6.5C11.614 7.43149 13.5 9.27705 14 10.3751M15.5 8C15.5 8 15.3707 7.5 14.9957 6C14.4957 4 15.9957 3.5 16.4957 4.5C17.1281 5.76491 18.2872 10.9147 18.4957 13" />
                                            </svg>
                                            <span>Recept genereren</span>
                                            <svg
                                                className="ml-2 h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
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
