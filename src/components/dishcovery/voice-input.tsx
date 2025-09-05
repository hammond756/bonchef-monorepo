import { Button } from "@/components/ui/button"
import { Mic, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceState {
    isRecording: boolean
    audioBlob: Blob | null
    audioBlobs: Blob[]
}

interface VoiceInputProps {
    voiceState: VoiceState
    hasAudio: boolean
    onStartRecording: () => void
    onStopRecording: () => void
    onSwitchToText: () => void
    onError: (error: string) => void
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
                        onClick={handleMicrophoneClick}
                        className={`relative z-10 h-16 w-16 rounded-full transition-all duration-300 sm:h-20 sm:w-20 ${
                            voiceState.isRecording
                                ? "bg-[#b9e7ca] text-[#157f3d] shadow-lg hover:bg-[#a1ddb8]"
                                : "bg-[#385940] text-white hover:bg-[#2b2b2b]"
                        }`}
                        aria-label={voiceState.isRecording ? "Stop opname" : "Beginnen met spreken"}
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
                    ? "Druk op de microfoon knop als je klaar bent met praten"
                    : hasAudio
                      ? `Top! Je hebt ${voiceState.audioBlobs.length} opname${voiceState.audioBlobs.length > 1 ? "s" : ""} gemaakt. Druk op Bonchef!! als je klaar bent of druk op de microfoon om verder te praten`
                      : "De microfoon start automatisch. Spreek je beschrijving in en klik op de knop om te stoppen."}
            </p>

            {/* "Ik kan nu niet praten" button */}
            <div className="mt-4">
                <Button
                    variant="outline"
                    size="default"
                    onClick={onSwitchToText}
                    className="border-text-muted text-text-default h-10 hover:bg-gray-50 sm:h-9"
                >
                    <Type className="mr-2 h-4 w-4" />
                    Ik kan nu niet praten
                </Button>
            </div>
        </div>
    )
}
