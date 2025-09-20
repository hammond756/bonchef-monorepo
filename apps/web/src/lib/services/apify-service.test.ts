import { describe, it, expect, vi, beforeEach } from "vitest"
import { ApifyService } from "./apify-service"
import { ApifyClient } from "apify-client"

// Mock the ApifyClient
vi.mock("apify-client")

// Types for mock data
interface MockInstagramItem {
    type: string
    videoUrl?: string
    caption?: string
    ownerUsername?: string
    url?: string
}

interface MockTikTokItem {
    text: string
    webVideoUrl: string
    authorMeta: {
        nickName: string
    }
    videoMeta: {
        coverUrl: string
        downloadAddr: string
    }
}

interface MockDatasetResponse {
    items: (MockInstagramItem | MockTikTokItem)[]
}

interface MockRunResponse {
    defaultDatasetId: string
}

// Helper function to create mock responses
function createMockResponses(
    mockItems: (MockInstagramItem | MockTikTokItem)[],
    datasetId: string = "dataset-id"
): {
    mockRun: MockRunResponse
    mockDatasetItems: MockDatasetResponse
} {
    return {
        mockRun: { defaultDatasetId: datasetId },
        mockDatasetItems: { items: mockItems },
    }
}

// Helper function to set up mocks for a specific test
function setupMocks(
    mockApifyClient: ApifyClient,
    mockItems: (MockInstagramItem | MockTikTokItem)[],
    shouldFail: boolean = false,
    errorMessage?: string
) {
    const { mockRun, mockDatasetItems } = createMockResponses(mockItems)

    if (shouldFail) {
        ;((mockApifyClient.actor("ID_OF_THE_ACTOR") as any).call as any).mockRejectedValue(
            new Error(errorMessage || "API call failed")
        )
    } else {
        ;((mockApifyClient.actor("ID_OF_THE_ACTOR") as any).call as any).mockResolvedValue(mockRun)
        ;(
            (mockApifyClient.dataset(mockRun.defaultDatasetId) as any).listItems as any
        ).mockResolvedValue(mockDatasetItems)
    }
}

describe("ApifyService", () => {
    const mockApiToken = "test-token"
    let apifyService: ApifyService
    let mockApifyClient: ApifyClient

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks()

        // Create a new instance of the mocked client for each test
        mockApifyClient = new ApifyClient({ token: mockApiToken })
        apifyService = new ApifyService({ apiToken: mockApiToken })

        // Set up the mock implementations
        const actorMock = { call: vi.fn() }
        const datasetMock = { listItems: vi.fn() }

        ;(mockApifyClient.actor as any).mockReturnValue(actorMock)
        ;(mockApifyClient.dataset as any).mockReturnValue(datasetMock)
    })

    it("should successfully scrape an Instagram reel", async () => {
        const reelUrl = "https://www.instagram.com/reel/C12345/"
        const mockItems: MockInstagramItem[] = [
            {
                type: "Video",
                videoUrl: "http://example.com/video.mp4",
                caption: "A delicious recipe",
                ownerUsername: "testuser",
                url: "https://www.instagram.com/reel/C12345/",
            },
        ]

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeInstagramReel(reelUrl)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.videoUrl).toBe("http://example.com/video.mp4")
            expect(result.data.caption).toBe("A delicious recipe")
            expect(result.data.author).toBe("testuser")
            expect(result.data.canonicalUrl).toBe("https://www.instagram.com/reel/C12345/")
        }
    })

    it("should return an error if no items are found", async () => {
        const reelUrl = "https://www.instagram.com/reel/C12345/"
        const mockItems: MockInstagramItem[] = []

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeInstagramReel(reelUrl)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error).toBe("No items found in the result.")
        }
    })

    it("should return an error if the post is not a video", async () => {
        const reelUrl = "https://www.instagram.com/reel/C12345/"
        const mockItems: MockInstagramItem[] = [{ type: "image" }]

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeInstagramReel(reelUrl)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error).toBe(
                "Het lijkt er op dat de link die je gebruikt hebt geen reel is."
            )
        }
    })

    it("should handle API errors gracefully", async () => {
        const reelUrl = "https://www.instagram.com/reel/C12345/"
        const errorMessage = "API call failed"
        const mockItems: MockInstagramItem[] = []

        setupMocks(mockApifyClient, mockItems, true, errorMessage)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeInstagramReel(reelUrl)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error).toBe(
                "Er ging iets mis bij het ophalen van de instagram content. Helaas is het niet duidelijk wat de oorzaak is."
            )
        }
    })

    it("should successfully scrape a TikTok video with canonicalUrl", async () => {
        const tiktokUrl = "https://www.tiktok.com/@user/video/1234567890"
        const mockItems: MockTikTokItem[] = [
            {
                text: "A delicious recipe video",
                webVideoUrl: "https://www.tiktok.com/@user/video/1234567890",
                authorMeta: {
                    nickName: "tiktokuser",
                },
                videoMeta: {
                    coverUrl: "http://example.com/cover.jpg",
                    downloadAddr: "http://example.com/video.mp4",
                },
            },
        ]

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeTikTok(tiktokUrl)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.videoUrl).toBe("http://example.com/video.mp4")
            expect(result.data.caption).toBe("A delicious recipe video")
            expect(result.data.author).toBe("tiktokuser")
            expect(result.data.thumbnailUrl).toBe("http://example.com/cover.jpg")
            expect(result.data.canonicalUrl).toBe("https://www.tiktok.com/@user/video/1234567890")
        }
    })

    it("should use canonicalUrl from Apify response instead of original sourceData", async () => {
        const originalUrl =
            "https://www.instagram.com/reel/C12345/?igs=dflskJEkje&otherParam=something"
        const canonicalUrl = "https://www.instagram.com/reel/C12345/"

        const mockItems: MockInstagramItem[] = [
            {
                type: "Video",
                videoUrl: "http://example.com/video.mp4",
                caption: "A delicious recipe",
                ownerUsername: "testuser",
                url: canonicalUrl, // This should be different from originalUrl
            },
        ]

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeInstagramReel(originalUrl)

        expect(result.success).toBe(true)
        if (result.success) {
            // The canonicalUrl should be the clean URL from Apify, not the original URL with parameters
            expect(result.data.canonicalUrl).toBe(canonicalUrl)
            expect(result.data.canonicalUrl).not.toBe(originalUrl)
            expect(result.data.canonicalUrl).not.toContain("?igs=")
        }
    })

    it("should return canonicalUrl that differs from input URL for TikTok", async () => {
        const inputUrl =
            "https://www.tiktok.com/@user/video/1234567890?is_from_webapp=1&sender_device=pc"
        const canonicalUrl = "https://www.tiktok.com/@user/video/1234567890"

        const mockItems: MockTikTokItem[] = [
            {
                text: "A delicious recipe video",
                webVideoUrl: canonicalUrl, // Clean URL without tracking parameters
                authorMeta: {
                    nickName: "tiktokuser",
                },
                videoMeta: {
                    coverUrl: "http://example.com/cover.jpg",
                    downloadAddr: "http://example.com/video.mp4",
                },
            },
        ]

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeTikTok(inputUrl)

        expect(result.success).toBe(true)
        if (result.success) {
            // The canonicalUrl should be the clean URL from Apify, not the input URL with parameters
            expect(result.data.canonicalUrl).toBe(canonicalUrl)
            expect(result.data.canonicalUrl).not.toBe(inputUrl)
            expect(result.data.canonicalUrl).not.toContain("?is_from_webapp=")
            expect(result.data.canonicalUrl).not.toContain("sender_device=")
        }
    })

    it("should handle Instagram URL with tracking parameters and return clean canonicalUrl", async () => {
        const inputUrl =
            "https://www.instagram.com/reel/C12345/?utm_source=ig_web_copy_link&igshid=MzRlODBiNWFlZA=="
        const canonicalUrl = "https://www.instagram.com/reel/C12345/"

        const mockItems: MockInstagramItem[] = [
            {
                type: "Video",
                videoUrl: "http://example.com/video.mp4",
                caption: "A delicious recipe",
                ownerUsername: "testuser",
                url: canonicalUrl, // Clean URL without tracking parameters
            },
        ]

        setupMocks(mockApifyClient, mockItems)
        ;(apifyService as any).client = mockApifyClient

        const result = await apifyService.scrapeInstagramReel(inputUrl)

        expect(result.success).toBe(true)
        if (result.success) {
            // The canonicalUrl should be the clean URL from Apify, not the input URL with tracking parameters
            expect(result.data.canonicalUrl).toBe(canonicalUrl)
            expect(result.data.canonicalUrl).not.toBe(inputUrl)
            expect(result.data.canonicalUrl).not.toContain("utm_source=")
            expect(result.data.canonicalUrl).not.toContain("igshid=")
        }
    })
})
