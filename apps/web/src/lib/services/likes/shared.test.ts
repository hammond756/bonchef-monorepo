import { describe, it, expect } from "vitest"
import {
    isRecipeLikedWithClient,
    likeRecipeWithClient,
    unlikeRecipeWithClient,
    getRecipeLikeCountWithClient,
} from "./shared"

describe("Like Service Shared Functions", () => {
    it("checks if recipe is liked by user", async () => {
        const mockClient = {
            from: () => ({
                select: () => ({
                    eq: () => ({
                        eq: () => ({
                            maybeSingle: async () => ({
                                data: { id: "like-1" },
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        }

        const mockUser = { id: "user-1" }
        const result = await isRecipeLikedWithClient(mockClient as any, "recipe-1", mockUser as any)
        expect(result).toBe(true)
    })

    it("returns false when recipe is not liked", async () => {
        const mockClient = {
            from: () => ({
                select: () => ({
                    eq: () => ({
                        eq: () => ({
                            maybeSingle: async () => ({
                                data: null,
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        }

        const mockUser = { id: "user-1" }
        const result = await isRecipeLikedWithClient(mockClient as any, "recipe-1", mockUser as any)
        expect(result).toBe(false)
    })

    it("throws error on database error", async () => {
        const mockClient = {
            from: () => ({
                select: () => ({
                    eq: () => ({
                        eq: () => ({
                            maybeSingle: async () => ({
                                data: null,
                                error: { message: "DB Error" },
                            }),
                        }),
                    }),
                }),
            }),
        }

        const mockUser = { id: "user-1" }
        await expect(
            isRecipeLikedWithClient(mockClient as any, "recipe-1", mockUser as any)
        ).rejects.toThrow("Failed to check like status: DB Error")
    })

    it("likes a recipe successfully", async () => {
        const mockClient = {
            from: () => ({
                insert: () => ({
                    data: { id: "like-1" },
                    error: null,
                }),
            }),
        }

        const mockUser = { id: "user-1" }
        await expect(
            likeRecipeWithClient(mockClient as any, "recipe-1", mockUser as any)
        ).resolves.not.toThrow()
    })

    it("throws authentication error when user not authenticated", async () => {
        const mockClient = {
            from: () => ({
                insert: () => ({
                    data: null,
                    error: { code: "42501", message: "Permission denied" },
                }),
            }),
        }

        const mockUser = { id: "user-1" }
        await expect(
            likeRecipeWithClient(mockClient as any, "recipe-1", mockUser as any)
        ).rejects.toThrow("Authentication required")
    })

    it("gets recipe like count", async () => {
        const mockClient = {
            from: () => ({
                select: () => ({
                    eq: () => ({
                        count: 5,
                        error: null,
                    }),
                }),
            }),
        }

        const result = await getRecipeLikeCountWithClient(mockClient as any, "recipe-1")
        expect(result).toBe(5)
    })

    it("returns 0 when no likes", async () => {
        const mockClient = {
            from: () => ({
                select: () => ({
                    eq: () => ({
                        count: 0,
                        error: null,
                    }),
                }),
            }),
        }

        const result = await getRecipeLikeCountWithClient(mockClient as any, "recipe-1")
        expect(result).toBe(0)
    })
})
