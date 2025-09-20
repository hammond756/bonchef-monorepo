"use client"

import { useState } from "react"
import { PhotoDisplay } from "./photo-display"
import { VoiceInput } from "./voice-input"
import { TextInput } from "./text-input"
import { ContinueButton } from "./continue-button"
import { ErrorMessage } from "./error-message"
import { useInputMode } from "@/hooks/use-input-mode"
import { useDishcoveryProcessing } from "@/hooks/use-dishcovery-processing"
import { useVoiceRecording } from "@/hooks/use-voice-recording"
import { BackButton } from "../ui/back-button"

interface DishcoveryDescriptionProps {
    photo: {
        id: string
        dataUrl: string
        file: File
    }
    onBack: () => void
    onContinue: () => void
}

export function DishcoveryDescription({
    photo,
    onBack,
    onContinue,
}: Readonly<DishcoveryDescriptionProps>) {
    console.log("[DishcoveryDescription] Component rendered")

    const [error, setError] = useState<string | null>(null)

    // Custom hooks for state management
    const { inputMode, textInput, switchToTextMode, switchToVoiceMode, updateTextInput } =
        useInputMode("voice")
    const { isProcessing, processDishcovery } = useDishcoveryProcessing({
        onSuccess: onContinue,
        onError: setError,
    })

    // Voice recording hook - only active in voice mode
    const { voiceState, hasAudio, startRecording, stopRecording, clearAudio } = useVoiceRecording({
        autoStart: inputMode === "voice",
        onError: setError,
    })

    // Validation logic - require audio blobs in voice mode, or text input in text mode
    const hasValidInput = inputMode === "voice" ? hasAudio : textInput.trim().length >= 3
    const canProceed = hasValidInput && !isProcessing

    const handleContinue = async () => {
        await processDishcovery(photo.file, inputMode, textInput, voiceState.audioFiles)
    }

    return (
        <div className="flex h-full flex-col lg:flex-row">
            <BackButton handleBack={onBack} />

            {/* Photo display - responsive sizing */}
            <div className="h-2/5 lg:w-1/2 lg:flex-shrink-0">
                <PhotoDisplay photo={photo} />
            </div>

            {/* Input section - responsive layout */}
            <div
                id="main-content"
                className="bg-surface z-10 flex-1 p-4 sm:p-6 lg:-mt-0 lg:flex lg:flex-col lg:justify-center"
            >
                {/* Title and subtitle */}
                <div className="mb-4 text-center lg:mb-6 lg:text-left">
                    <h1 className="text-text-default mb-2 text-xl font-semibold sm:text-2xl">
                        Vertel meer over dit gerecht
                    </h1>
                    <p
                        className="text-text-muted px-2 text-sm sm:text-base lg:px-0"
                        id="text-instructions"
                    >
                        Beschrijf <span className="font-bold">ingrediënten</span>,{" "}
                        <span className="font-bold">smaken</span>,{" "}
                        <span className="font-bold">kruiden</span>, en{" "}
                        <span className="font-bold">alles wat bijzonder is</span>.
                    </p>
                </div>

                {/* Input mode components */}
                {inputMode === "voice" ? (
                    <VoiceInput
                        voiceState={voiceState}
                        hasAudio={hasAudio}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                        onSwitchToText={switchToTextMode}
                        onError={setError}
                        onClearAudio={clearAudio}
                    />
                ) : (
                    <TextInput
                        value={textInput}
                        onChange={updateTextInput}
                        onSwitchToVoice={switchToVoiceMode}
                        onError={setError}
                        error={error}
                    />
                )}

                {/* Error message */}
                <ErrorMessage error={error} />

                {/* Continue button */}
                <ContinueButton
                    onClick={handleContinue}
                    disabled={!canProceed}
                    isProcessing={isProcessing}
                />
            </div>
        </div>
    )
}
