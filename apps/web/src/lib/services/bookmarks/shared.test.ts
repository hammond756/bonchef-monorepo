import { describe, it, expect, vi } from "vitest"
import {
    getBookmarkedRecipesWithClient,
    bookmarkRecipeWithClient,
    unbookmarkRecipeWithClient,
    isRecipeBookmarkedWithClient,
} from "./shared"

const createMockSupabaseClient = (response: { data?: unknown; error?: unknown }) => {
    const result = {
        data: response.data,
        error: response.error,
    }

    const chainable = new Proxy(
        {},
        {
            get(target, prop) {
                if (prop === "then") {
                    return (resolve: (value: unknown) => void) => resolve(result)
                }
                return () => chainable
            },
        }
    )

    return {
        from: vi.fn().mockReturnValue(chainable),
    }
}

describe("Bookmark Service", () => {
    describe("getBookmarkedRecipesWithClient", () => {
        it("should return bookmarked recipes on success", async () => {
            const mockBookmarks = [
                {
                    recipe_id: "recipe-1",
                    recipes: {
                        id: "recipe-1",
                        title: "Test Recipe",
                        description: "A test recipe",
                        image_url: "test.jpg",
                        created_at: "2024-01-01T00:00:00Z",
                        updated_at: "2024-01-01T00:00:00Z",
                        user_id: "user-1",
                        is_public: true,
                        profiles: {
                            id: "user-1",
                            display_name: "Test User",
                            avatar: null,
                        },
                    },
                },
            ]
            const client = createMockSupabaseClient({ data: mockBookmarks })
            const user = { id: "user-1" } as any

            const result = await getBookmarkedRecipesWithClient(client as any, user)
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe("recipe-1")
        })

        it("should throw an error on failure", async () => {
            const client = createMockSupabaseClient({
                error: { message: "Fetch failed" },
            })
            const user = { id: "user-1" } as any

            await expect(getBookmarkedRecipesWithClient(client as any, user)).rejects.toThrow(
                "Failed to fetch bookmarked recipes: Fetch failed"
            )
        })
    })

    describe("bookmarkRecipeWithClient", () => {
        it("should not throw on success", async () => {
            const client = createMockSupabaseClient({})
            const user = { id: "user-1" } as any

            await expect(
                bookmarkRecipeWithClient(client as any, "recipe-1", user)
            ).resolves.not.toThrow()
        })

        it("should throw authentication error", async () => {
            const client = createMockSupabaseClient({
                error: { code: "42501", message: "Permission denied" },
            })
            const user = { id: "user-1" } as any

            await expect(bookmarkRecipeWithClient(client as any, "recipe-1", user)).rejects.toThrow(
                "Authentication required"
            )
        })

        it("should throw general error", async () => {
            const client = createMockSupabaseClient({
                error: { message: "Insert failed" },
            })
            const user = { id: "user-1" } as any

            await expect(bookmarkRecipeWithClient(client as any, "recipe-1", user)).rejects.toThrow(
                "Failed to bookmark recipe: Insert failed"
            )
        })
    })

    describe("unbookmarkRecipeWithClient", () => {
        it("should not throw on success", async () => {
            const client = createMockSupabaseClient({})
            const user = { id: "user-1" } as any

            await expect(
                unbookmarkRecipeWithClient(client as any, "recipe-1", user)
            ).resolves.not.toThrow()
        })

        it("should throw an error on failure", async () => {
            const client = createMockSupabaseClient({
                error: { message: "Delete failed" },
            })
            const user = { id: "user-1" } as any

            await expect(
                unbookmarkRecipeWithClient(client as any, "recipe-1", user)
            ).rejects.toThrow("Failed to unbookmark recipe: Delete failed")
        })
    })

    describe("isRecipeBookmarkedWithClient", () => {
        it("should return true when bookmarked", async () => {
            const client = createMockSupabaseClient({
                data: { recipe_id: "recipe-1" },
            })
            const user = { id: "user-1" } as any

            const result = await isRecipeBookmarkedWithClient(client as any, "recipe-1", user)
            expect(result).toBe(true)
        })

        it("should return false when not bookmarked", async () => {
            const client = createMockSupabaseClient({ data: null })
            const user = { id: "user-1" } as any

            const result = await isRecipeBookmarkedWithClient(client as any, "recipe-1", user)
            expect(result).toBe(false)
        })

        it("should throw on other errors", async () => {
            const client = createMockSupabaseClient({
                error: { message: "Database error" },
            })
            const user = { id: "user-1" } as any

            await expect(
                isRecipeBookmarkedWithClient(client as any, "recipe-1", user)
            ).rejects.toThrow("Failed to check bookmark status: Database error")
        })
    })
})
