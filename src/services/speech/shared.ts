import type { SupabaseClient } from "@supabase/supabase-js"

export interface SpeechTranscriptionResult {
    transcript: string
    confidence: number
    languageCode: string
}

export interface SpeechTranscriptionOptions {
    languageCode?: string
    model?: string
    enableAutomaticPunctuation?: boolean
    enableWordTimeOffsets?: boolean
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 * This function accepts base64 audio data directly
 */
export async function transcribeAudioWithClient(
    client: SupabaseClient,
    base64Audio: string,
    options: SpeechTranscriptionOptions = {}
): Promise<SpeechTranscriptionResult> {
    // Default options
    const defaultOptions: SpeechTranscriptionOptions = {
        languageCode: "nl-NL",
        model: "latest_long",
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        ...options,
    }

    try {
        // Call our API endpoint that handles Google Cloud Speech-to-Text
        const response = await fetch("/api/speech/transcribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                base64Audio,
                options: defaultOptions,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to transcribe audio")
        }

        const result = await response.json()
        return result
    } catch (error) {
        console.error("Speech transcription error:", error)
        throw new Error(error instanceof Error ? error.message : "Speech transcription failed")
    }
}

/**
 * Transcribe base64 audio data directly without using fetch (for background jobs)
 * This function can be used in server-side contexts where fetch to localhost won't work
 */
export async function transcribeBase64AudioWithClient(
    client: SupabaseClient,
    base64Audio: string,
    options: SpeechTranscriptionOptions = {}
): Promise<SpeechTranscriptionResult> {
    // Default options
    const defaultOptions: SpeechTranscriptionOptions = {
        languageCode: "nl-NL",
        model: "latest_long",
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        ...options,
    }

    try {
        // For background jobs, we need to call the Google Cloud Speech-to-Text API directly
        // Import the SpeechClient dynamically to avoid issues in client-side contexts
        const { SpeechClient } = await import("@google-cloud/speech")

        // Initialize Google Cloud Speech client
        const speechClient = new SpeechClient({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        })

        // Decode base64 audio data
        const audioBuffer = Buffer.from(base64Audio, "base64")
        const audioContent = audioBuffer.toString("base64")

        // Configure speech recognition request
        const speechRequest = {
            audio: {
                content: audioContent,
            },
            config: {
                encoding: "WEBM_OPUS" as const,
                sampleRateHertz: 48000,
                languageCode: defaultOptions.languageCode || "nl-NL",
                model: defaultOptions.model || "latest_long",
                enableAutomaticPunctuation: defaultOptions.enableAutomaticPunctuation ?? true,
                enableWordTimeOffsets: defaultOptions.enableWordTimeOffsets ?? false,
            },
        }

        // Perform speech recognition
        const [response] = await speechClient.recognize(speechRequest)

        if (!response.results || response.results.length === 0) {
            throw new Error("No speech detected in audio")
        }

        // Combine all transcripts
        const transcript = response.results
            .map((result) => result.alternatives?.[0]?.transcript || "")
            .join(" ")
            .trim()

        const confidence = response.results[0]?.alternatives?.[0]?.confidence || 0

        return {
            transcript,
            confidence,
            languageCode: defaultOptions.languageCode || "nl-NL",
        }
    } catch (error) {
        console.error("Speech transcription error:", error)
        throw new Error(error instanceof Error ? error.message : "Speech transcription failed")
    }
}
