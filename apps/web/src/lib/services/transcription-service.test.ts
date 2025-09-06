import { describe, it, expect, vi, beforeEach } from "vitest"
import { TranscriptionService } from "./transcription-service"
import OpenAI from "openai"

// Mock the OpenAI client
vi.mock("openai")

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("TranscriptionService", () => {
    const mockApiKey = "test-api-key"
    let transcriptionService: TranscriptionService
    let mockOpenai: OpenAI

    beforeEach(() => {
        vi.clearAllMocks()

        mockOpenai = new OpenAI({ apiKey: mockApiKey })
        transcriptionService = new TranscriptionService({ apiKey: mockApiKey })

        // Mock the nested audio.transcriptions property
        mockOpenai.audio = {
            transcriptions: {
                create: vi.fn(),
            },
        } as any

        // Inject the mocked client into the service instance for testing
        ;(transcriptionService as any).openai = mockOpenai
    })

    it("should successfully transcribe a video from a URL", async () => {
        const videoUrl = "http://example.com/video.mp4"
        const mockTranscription = "This is a test transcription."

        // Mock fetch to return a successful response
        mockFetch.mockResolvedValue({
            ok: true,
            statusText: "OK",
            status: 200,
            headers: new Headers({
                "content-type": "video/mp4",
            }),
            // The OpenAI client expects a response object that it can process
            // For this mock, the presence of the object is enough
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        })

        // Mock the transcription create method
        ;((mockOpenai.audio.transcriptions as any).create as any).mockResolvedValue(
            mockTranscription
        )

        const result = await transcriptionService.transcribeVideoFromUrl(videoUrl)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toBe(mockTranscription)
        }
        expect(fetch).toHaveBeenCalledWith(videoUrl, {
            method: "GET",
        })
    })

    it("should return an error if downloading the video fails", async () => {
        const videoUrl = "http://example.com/video.mp4"

        mockFetch.mockResolvedValue({
            ok: false,
            statusText: "Not Found",
            status: 404,
        })

        const result = await transcriptionService.transcribeVideoFromUrl(videoUrl)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error).toBe("Failed to download video: 404 Not Found")
        }
    })

    it("should return an error if the transcription API call fails", async () => {
        const videoUrl = "http://example.com/video.mp4"
        const errorMessage = "Transcription failed"

        mockFetch.mockResolvedValue({
            ok: true,
            statusText: "OK",
            status: 200,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
            headers: new Headers({
                "content-type": "video/mp4",
            }),
        })
        ;((mockOpenai.audio.transcriptions as any).create as any).mockRejectedValue(
            new Error(errorMessage)
        )

        const result = await transcriptionService.transcribeVideoFromUrl(videoUrl)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error).toBe(errorMessage)
        }
    })
})
