import { useCallback, useEffect, useRef, useState } from "react"

interface VoiceState {
    isRecording: boolean
    audioFiles: File[]
}

interface UseVoiceRecordingOptions {
    autoStart?: boolean
    onError?: (error: string | null) => void
}

/**
 * Custom hook for managing voice recording functionality
 * Handles microphone access, recording state, and audio file management
 */
export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
    const { autoStart = false, onError } = options

    const [voiceState, setVoiceState] = useState<VoiceState>({
        isRecording: false,
        audioFiles: [],
    })

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const hasAttemptedRecordingRef = useRef(false)

    const startRecording = useCallback(async () => {
        console.log("[useVoiceRecording] startRecording called")
        try {
            onError?.(null)
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
                    // Convert Blob to File with proper metadata
                    const audioFile = new File(
                        [audioBlob],
                        `recording-${Date.now()}.${mimeType.split("/")[1].split(";")[0]}`,
                        {
                            type: mimeType,
                            lastModified: Date.now(),
                        }
                    )
                    setVoiceState((prev) => ({
                        ...prev,
                        audioFile,
                        audioFiles: [...prev.audioFiles, audioFile],
                        isRecording: false,
                    }))
                    // Clean up stream tracks
                    stream.getTracks().forEach((track) => track.stop())
                } catch (error) {
                    console.error("Error creating audio file:", error)
                    onError?.("Er ging iets mis bij het verwerken van de opname.")
                }
            }

            mediaRecorder.start()
            setVoiceState((prev) => ({ ...prev, isRecording: true }))
        } catch (error) {
            console.error("Failed to start recording:", error)
            onError?.("Kon microfoon niet starten. Controleer je instellingen.")
        }
    }, [onError])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && voiceState.isRecording) {
            mediaRecorderRef.current.stop()
            setVoiceState((prev) => ({ ...prev, isRecording: false }))
        }
    }, [voiceState.isRecording])

    const clearAudio = useCallback(() => {
        setVoiceState((prev) => ({ ...prev, audioFile: null, audioFiles: [] }))
    }, [])

    const resetAutoStart = useCallback(() => {
        hasAttemptedRecordingRef.current = false
    }, [])

    // Auto-start microphone when enabled (only once)
    useEffect(() => {
        if (
            autoStart &&
            !voiceState.isRecording &&
            voiceState.audioFiles.length === 0 &&
            !hasAttemptedRecordingRef.current
        ) {
            console.log("[useVoiceRecording] Auto-starting voice recording...")
            hasAttemptedRecordingRef.current = true
            startRecording()
        }
    }, [autoStart, voiceState.isRecording, voiceState.audioFiles.length, startRecording])

    return {
        voiceState,
        startRecording,
        stopRecording,
        clearAudio,
        resetAutoStart,
        hasAudio: voiceState.audioFiles.length > 0,
    }
}
