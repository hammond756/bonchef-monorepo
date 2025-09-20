import { Button } from "@/components/ui/button"
import { Mic, Trash, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DestructiveButton } from "../ui/destructive-button"

interface VoiceState {
    isRecording: boolean
    audioFiles: File[]
}

interface VoiceInputProps {
    voiceState: VoiceState
    hasAudio: boolean
    onStartRecording: () => void
    onStopRecording: () => void
    onSwitchToText: () => void
    onError: (error: string) => void
    onClearAudio: () => void
}

/**
 * Voice input component with recording functionality
 * Handles microphone access, recording state, and audio visualization
 */
export function VoiceInput({
    voiceState,
    hasAudio,
    onStartRecording,
    onStopRecording,
    onSwitchToText,
    onClearAudio,
    onError: _onError,
}: Readonly<VoiceInputProps>) {
    const handleMicrophoneClick = () => {
        if (voiceState.isRecording) {
            onStopRecording()
        } else {
            onStartRecording()
        }
    }

    return (
        <div className="mb-6 text-center">
            <div className="relative inline-flex items-center justify-center">
                {/* Pulsing sound wave bars to left and right when listening */}
                {voiceState.isRecording && (
                    <>
                        {/* Left side wave bars */}
                        <div className="absolute top-1/2 left-0 flex -translate-x-8 -translate-y-1/2 flex-row items-center gap-1 sm:-translate-x-12">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <motion.div
                                    key={`left-${index}`}
                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                    animate={{
                                        height: [8, 16 + index * 2, 8],
                                        opacity: [0.9, 0.4, 0.9],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.2,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Right side wave bars */}
                        <div className="absolute top-1/2 right-0 flex translate-x-8 -translate-y-1/2 flex-row items-center gap-1 sm:translate-x-12">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <motion.div
                                    key={`right-${index}`}
                                    className="h-2 w-1 rounded-full bg-[#268a40]"
                                    animate={{
                                        height: [8, 16 + index * 2, 8],
                                        opacity: [0.9, 0.4, 0.9],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.2,
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Main microphone button */}
                <Button
                    onClick={handleMicrophoneClick}
                    className="relative z-10 h-16 w-16 rounded-full p-0 shadow-lg transition-all duration-300 sm:h-20 sm:w-20"
                    aria-label={voiceState.isRecording ? "Stop opname" : "Beginnen met spreken"}
                >
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
                        className={`flex h-full w-full items-center justify-center rounded-full shadow-lg ${
                            voiceState.isRecording
                                ? "bg-[#b9e7ca] text-[#157f3d] hover:bg-[#a1ddb8]"
                                : "bg-[#385940] text-white hover:bg-[#2b2b2b]"
                        }`}
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
                    </motion.div>
                </Button>

                {/* Trash can button - only show when not recording and has audio */}
                {!voiceState.isRecording && hasAudio && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-2 -right-2 z-20"
                    >
                        <DestructiveButton
                            onConfirm={onClearAudio}
                            isLoading={false}
                            alertTitle="Audio wissen"
                            alertDescription="Weet je zeker dat je de audio wilt wissen?"
                        >
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 rounded-full p-0 shadow-lg hover:bg-red-600"
                                aria-label="Audio wissen"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </DestructiveButton>
                    </motion.div>
                )}
            </div>

            <p className="mt-2 text-sm text-gray-600">
                {(() => {
                    if (voiceState.isRecording)
                        return "Druk op de microfoon knop als je klaar bent met praten"
                    if (hasAudio) {
                        let opnameText = "opname"
                        if (voiceState.audioFiles.length > 1) opnameText += "s"
                        return (
                            `Top! Je hebt ${voiceState.audioFiles.length} ${opnameText} gemaakt. ` +
                            "Druk op Bonchef!! als je klaar bent of druk op de microfoon om verder te praten"
                        )
                    }
                    return "De microfoon start automatisch. Spreek je beschrijving in en klik op de knop om te stoppen."
                })()}
            </p>

            {/* "Ik kan nu niet praten" button */}
            <div className="mt-4">
                <Button
                    variant="outline"
                    size="default"
                    onClick={onSwitchToText}
                    className="border-text-muted text-text-default h-10 hover:bg-gray-50 sm:h-9"
                    aria-label="Ik kan nu niet praten"
                >
                    <Type className="mr-2 h-4 w-4" />
                    Ik kan nu niet praten
                </Button>
            </div>
        </div>
    )
}
