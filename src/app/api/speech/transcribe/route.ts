import { NextRequest, NextResponse } from "next/server"
import { SpeechClient } from "@google-cloud/speech"

// Initialize Google Cloud Speech client
const speechClient = new SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

export async function POST(request: NextRequest) {
    try {
        const { base64Audio, options } = await request.json()

        if (!base64Audio) {
            return NextResponse.json({ error: "Base64 audio data is required" }, { status: 400 })
        }

        // Decode base64 audio data
        const audioBuffer = Buffer.from(base64Audio, "base64")
        const audioContent = audioBuffer.toString("base64")

        // Configure speech recognition request
        const speechRequest = {
            audio: {
                content: audioContent,
            },
            config: {
                encoding: "WEBM_OPUS" as const, // Default to WebM since that's what MediaRecorder usually produces
                sampleRateHertz: 48000, // Adjust based on your audio
                languageCode: options?.languageCode || "nl-NL",
                model: options?.model || "latest_long",
                enableAutomaticPunctuation: options?.enableAutomaticPunctuation ?? true,
                enableWordTimeOffsets: options?.enableWordTimeOffsets ?? false,
            },
        }

        // Perform speech recognition
        const [response] = await speechClient.recognize(speechRequest)

        if (!response.results || response.results.length === 0) {
            return NextResponse.json({ error: "No speech detected in audio" }, { status: 400 })
        }

        // Combine all transcripts
        const transcript = response.results
            .map((result) => result.alternatives?.[0]?.transcript || "")
            .join(" ")
            .trim()

        const confidence = response.results[0]?.alternatives?.[0]?.confidence || 0

        return NextResponse.json({
            transcript,
            confidence,
            languageCode: options?.languageCode || "nl-NL",
        })
    } catch (error) {
        console.error("Speech transcription error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Speech transcription failed",
            },
            { status: 500 }
        )
    }
}
