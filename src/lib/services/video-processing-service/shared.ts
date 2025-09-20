import { ServiceResponse } from "@/lib/types"

export interface VideoSummaryRequest {
    video_url: string
}

export interface VideoSummaryResponse {
    collage_url: string
    audio_url: string
    transcript: string
    frames_used: number
    seconds_per_frame: number
}

/**
 * Validates if a URL is a valid HTTP/HTTPS URL
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export function validateVideoUrl(url: string): boolean {
    try {
        const urlObj = new URL(url)
        return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
        return false
    }
}

/**
 * Processes a video URL through the external video processing service
 * @param apiEndpoint - The API endpoint URL
 * @param videoUrl - The video URL to process
 * @returns The video summary response or throws an error
 */
export async function processVideoUrlWithEndpoint(
    apiEndpoint: string,
    apiKey: string,
    videoUrl: string
): Promise<ServiceResponse<VideoSummaryResponse>> {
    const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": apiKey,
        },
        body: JSON.stringify({ video_url: videoUrl }),
    })

    if (!response.ok) {
        const errorData = await response.json()
        console.error({ response: errorData, status: response.status })
        return {
            success: false,
            error: "Er ging iets mis bij het verwerken van de video. Het is helaas niet duidelijk wat de oorzaak is.",
            data: null,
        }
    }

    return { success: true, data: await response.json(), error: null }
}
