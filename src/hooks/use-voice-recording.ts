import { useCallback, useEffect, useRef, useState } from "react"

interface VoiceState {
    isRecording: boolean
    audioBlob: Blob | null
    audioBlobs: Blob[]
}

interface UseVoiceRecordingOptions {
    autoStart?: boolean
    onError?: (error: string) => void
}

/**
 * Custom hook for managing voice recording functionality
 * Handles microphone access, recording state, and audio blob management
 */
export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
    const { autoStart = false, onError } = options

    const [voiceState, setVoiceState] = useState<VoiceState>({
        isRecording: false,
        audioBlob: null,
        audioBlobs: [],
    })

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const hasAttemptedRecordingRef = useRef(false)

    const startRecording = useCallback(async () => {
        console.log("[useVoiceRecording] startRecording called")
        try {
            console.log("[useVoiceRecording] Requesting microphone access...")
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            console.log("[useVoiceRecording] Microphone access granted")

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
                    setVoiceState((prev) => ({
                        ...prev,
                        audioBlob,
                        audioBlobs: [...prev.audioBlobs, audioBlob],
                        isRecording: false,
                    }))
                    // Clean up stream tracks
                    stream.getTracks().forEach((track) => track.stop())
                } catch (error) {
                    console.error("Error creating audio blob:", error)
                    onError?.("Er ging iets mis bij het verwerken van de opname.")
                }
            }

            mediaRecorder.start()
            setVoiceState((prev) => ({ ...prev, isRecording: true }))
        } catch (error) {
            console.error("Failed to start recording:", error)
            onError?.("Kon microfoon niet starten. Controleer je permissies.")
        }
    }, [onError])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && voiceState.isRecording) {
            mediaRecorderRef.current.stop()
            setVoiceState((prev) => ({ ...prev, isRecording: false }))
        }
    }, [voiceState.isRecording])

    const clearAudio = useCallback(() => {
        setVoiceState((prev) => ({ ...prev, audioBlob: null, audioBlobs: [] }))
    }, [])

    const resetAutoStart = useCallback(() => {
        hasAttemptedRecordingRef.current = false
    }, [])

    // Auto-start microphone when enabled (only once)
    useEffect(() => {
        if (
            autoStart &&
            !voiceState.isRecording &&
            voiceState.audioBlobs.length === 0 &&
            !hasAttemptedRecordingRef.current
        ) {
            console.log("[useVoiceRecording] Auto-starting voice recording...")
            hasAttemptedRecordingRef.current = true
            startRecording()
        }
    }, [autoStart, voiceState.isRecording, voiceState.audioBlobs.length, startRecording])

    return {
        voiceState,
        startRecording,
        stopRecording,
        clearAudio,
        resetAutoStart,
        hasAudio: voiceState.audioBlobs.length > 0,
    }
}
