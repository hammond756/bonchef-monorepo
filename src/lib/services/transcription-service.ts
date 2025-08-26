import OpenAI from "openai"

type ServiceResponse<T> = Promise<
    | {
          success: false
          error: string
      }
    | {
          success: true
          data: T
      }
>

/**
 * Maps MIME content types to file extensions for audio/video files.
 * Based on OpenAI Whisper API supported formats: ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']
 */
const contentTypeToExtension: Record<string, string> = {
    "audio/mpeg": "mpeg",
    "audio/mp3": "mp3",
    "audio/mp4": "m4a",
    "video/mp4": "mp4",
    "audio/webm": "webm",
    "video/webm": "webm",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/ogg": "oga",
    "audio/oga": "oga",
    "audio/flac": "flac",
    "audio/x-m4a": "m4a",
    "audio/mpga": "mpga",
}

/**
 * A service for handling video transcription using OpenAI's Speech-to-Text API.
 */
export class TranscriptionService {
    private openai: OpenAI

    /**
     * Creates an instance of TranscriptionService.
     * @param {Readonly<{ apiKey: string }>} options - The options containing the OpenAI API key.
     */
    constructor({ apiKey }: Readonly<{ apiKey: string }>) {
        this.openai = new OpenAI({ apiKey })
    }

    /**
     * Transcribes a video from a given URL.
     * It downloads the video, validates it, and sends it to OpenAI's transcription API.
     * @param {string} videoUrl - The URL of the video file (e.g., MP4).
     * @returns {ServiceResponse<string>} The transcribed text or an error.
     */
    async transcribeVideoFromUrl(videoUrl: string): ServiceResponse<string> {
        try {
            // Validate URL format
            if (!this.isValidUrl(videoUrl)) {
                return { success: false, error: "Invalid URL format provided" }
            }

            // Download the file
            const response = await fetch(videoUrl, {
                method: "GET",
            })

            if (!response.ok) {
                return {
                    success: false,
                    error: `Failed to download video: ${response.status} ${response.statusText}`,
                }
            }

            // Detect content type and validate it's supported
            const contentType = this.detectContentType(response, videoUrl)
            if (!contentType) {
                return {
                    success: false,
                    error: `Unsupported file type [${contentType}]. Please provide an audio or video file.`,
                }
            }

            // Download and buffer the file
            const arrayBuffer = await response.arrayBuffer()

            // Create a proper File object with correct extension
            const file = this.createFileFromBuffer(arrayBuffer, contentType)

            // Transcribe using OpenAI
            const transcriptionResponse = await this.transcribeAudioFile(file)

            return transcriptionResponse
        } catch (error) {
            console.error("Error transcribing video:", error)
            const errorMessage = this.formatErrorMessage(error)
            return { success: false, error: errorMessage }
        }
    }

    async transcribeAudioFile(file: File): ServiceResponse<string> {
        try {
            const transcription = await this.openai.audio.transcriptions.create({
                file,
                model: "whisper-1",
                response_format: "text",
            })

            return { success: true, data: transcription }
        } catch (error) {
            console.error("Error transcribing audio file:", error)
            const errorMessage = this.formatErrorMessage(error)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * Validates if the provided string is a valid URL.
     * @param {string} url - The URL to validate.
     * @returns {boolean} True if the URL is valid, false otherwise.
     */
    private isValidUrl(url: string): boolean {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    /**
     * Detects the content type from response headers or URL fallback.
     * @param {Response} response - The fetch response.
     * @param {string} videoUrl - The original video URL for fallback detection.
     * @returns {string | null} The detected content type or null if unsupported.
     */
    private detectContentType(response: Response, videoUrl: string): string | null {
        // Try to get content type from headers
        const headerContentType = response.headers.get("content-type")
        if (headerContentType) {
            const cleanType = headerContentType.split(";")[0].trim().toLowerCase()

            console.log("Detected content type:", cleanType)

            // Check if it's a supported audio/video type
            if (contentTypeToExtension[cleanType]) {
                return cleanType
            }
        }

        // Fallback: try to detect from URL
        const urlLower = videoUrl.toLowerCase()

        // Check for common audio/video file extensions in URL
        for (const [mimeType, ext] of Object.entries(contentTypeToExtension)) {
            if (urlLower.includes(`.${ext}`) || urlLower.includes(`mime_type=${ext}`)) {
                console.log("Detected content type from URL:", mimeType)
                return mimeType
            }
        }

        // Last resort: check for common patterns
        if (
            urlLower.includes("mime_type=audio_mpeg") ||
            urlLower.includes(".mpeg") ||
            urlLower.includes(".mp3")
        ) {
            return "audio/mpeg"
        }
        if (urlLower.includes(".mp4") || urlLower.includes("mime_type=video_mp4")) {
            return "video/mp4"
        }
        if (urlLower.includes(".oga") || urlLower.includes(".ogg")) {
            return "audio/oga"
        }
        if (urlLower.includes(".mpga")) {
            return "audio/mpga"
        }

        return null
    }

    /**
     * Creates a File object from an ArrayBuffer with proper metadata.
     * @param {ArrayBuffer} buffer - The file buffer.
     * @param {string} contentType - The detected content type.
     * @param {string} originalUrl - The original URL for filename generation.
     * @returns {File} A File object ready for OpenAI API.
     */
    private createFileFromBuffer(buffer: ArrayBuffer, contentType: string): File {
        // Generate a filename with proper extension
        const extension = contentTypeToExtension[contentType] || "m4a"
        const filename = `audio.${extension}`

        // Create File object with proper MIME type
        return new File([buffer], filename, {
            type: contentType,
            lastModified: Date.now(),
        })
    }

    /**
     * Gets MIME type from filename extension.
     * @param {string} filename - The filename to analyze.
     * @returns {string} The detected MIME type or empty string.
     */
    private getMimeTypeFromFilename(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase()
        if (!extension) return ""

        // Reverse lookup from extension to MIME type
        for (const [mimeType, ext] of Object.entries(contentTypeToExtension)) {
            if (ext === extension) {
                return mimeType
            }
        }
        return ""
    }

    /**
     * Formats error messages for consistent error handling.
     * @param {unknown} error - The error to format.
     * @returns {string} A formatted error message.
     */
    private formatErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            // Handle specific OpenAI API errors
            if (error.message.includes("insufficient_quota")) {
                return "OpenAI API quota exceeded. Please try again later."
            }
            if (error.message.includes("invalid_api_key")) {
                return "Invalid OpenAI API key. Please check your configuration."
            }
            if (error.message.includes("file_too_large")) {
                return "File is too large for transcription. Please use a smaller file."
            }
            if (error.message.includes("invalid_file_type")) {
                return "Invalid file type. Please provide an audio or video file."
            }
            return error.message
        }
        return "An unknown error occurred during transcription"
    }
}
