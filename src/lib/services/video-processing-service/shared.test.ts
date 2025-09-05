import { describe, it, expect, vi } from "vitest"
import { validateVideoUrl, processVideoUrlWithEndpoint } from "./shared"

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("Video Processing Service - Shared", () => {
    describe("validateVideoUrl", () => {
        it("should validate correct HTTP URLs", () => {
            expect(validateVideoUrl("http://example.com/video.mp4")).toBe(true)
            expect(validateVideoUrl("https://example.com/video.mp4")).toBe(true)
            expect(validateVideoUrl("https://www.youtube.com/watch?v=123")).toBe(true)
        })

        it("should reject invalid URLs", () => {
            expect(validateVideoUrl("not-a-url")).toBe(false)
            expect(validateVideoUrl("ftp://example.com/video.mp4")).toBe(false)
            expect(validateVideoUrl("")).toBe(false)
        })
    })

    describe("processVideoUrlWithEndpoint", () => {
        it("should successfully process a video URL", async () => {
            const mockResponse = {
                collage_url: "https://example.com/collage.jpg",
                audio_url: "https://example.com/audio.mp3",
                transcript: "This is a test transcript",
                frames_used: 10,
                seconds_per_frame: 2.0,
            }

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            })

            const result = await processVideoUrlWithEndpoint(
                "http://localhost:8000/api/v1/video/summarize",
                "api-key",
                "https://example.com/video.mp4"
            )

            expect(result).toEqual(mockResponse)
            expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/api/v1/video/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": "api-key",
                },
                body: JSON.stringify({ video_url: "https://example.com/video.mp4" }),
            })
        })

        it("should throw error on API failure", async () => {
            const mockError = {
                detail: "Video processing failed",
                status_code: 500,
            }

            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve(mockError),
            })

            await expect(
                processVideoUrlWithEndpoint(
                    "http://localhost:8000/api/v1/video/summarize",
                    "api-key",
                    "https://example.com/video.mp4"
                )
            ).rejects.toThrow("Video processing failed")
        })

        it("should throw error on network failure", async () => {
            mockFetch.mockRejectedValue(new Error("Network error"))

            await expect(
                processVideoUrlWithEndpoint(
                    "http://localhost:8000/api/v1/video/summarize",
                    "api-key",
                    "https://example.com/video.mp4"
                )
            ).rejects.toThrow("Network error")
        })
    })
})
