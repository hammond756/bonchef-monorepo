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
}

interface MockDatasetResponse {
    items: MockInstagramItem[]
}

interface MockRunResponse {
    defaultDatasetId: string
}

// Helper function to create mock responses
function createMockResponses(
    mockItems: MockInstagramItem[],
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
    mockItems: MockInstagramItem[],
    shouldFail: boolean = false,
    errorMessage?: string
) {
    const { mockRun, mockDatasetItems } = createMockResponses(mockItems)

    if (shouldFail) {
        ;((mockApifyClient.actor("shu8hvrXbJbY3Eb9W") as any).call as any).mockRejectedValue(
            new Error(errorMessage || "API call failed")
        )
    } else {
        ;((mockApifyClient.actor("shu8hvrXbJbY3Eb9W") as any).call as any).mockResolvedValue(
            mockRun
        )
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
})
