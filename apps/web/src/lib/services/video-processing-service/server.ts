import { ServiceResponse } from "@/lib/types"
import { processVideoUrlWithEndpoint, validateVideoUrl, type VideoSummaryResponse } from "./shared"

const API_BASE_URL = process.env.VIDEO_PROCESSING_API_URL || "http://localhost:8000"
const API_KEY = process.env.VIDEO_PROCESSING_API_KEY || ""
const API_ENDPOINT = `${API_BASE_URL}/api/v1/video/summarize`

/**
 * Processes a video URL and returns summary data including collage and transcript
 * @param videoUrl - The video URL to process
 * @returns Promise resolving to video summary response
 */
export const processVideoUrl = async (
    videoUrl: string
): Promise<ServiceResponse<VideoSummaryResponse>> => {
    return processVideoUrlWithEndpoint(API_ENDPOINT, API_KEY, videoUrl)
}

/**
 * Validates if a video URL is properly formatted
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const validateVideoUrlServer = (url: string): boolean => {
    return validateVideoUrl(url)
}
