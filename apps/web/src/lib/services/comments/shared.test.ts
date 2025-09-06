import { describe, it, expect, vi } from "vitest"
import {
    getCommentsForRecipeWithClient,
    createCommentWithClient,
    deleteCommentWithClient,
    getCommentCountWithClient,
} from "./shared"

const createMockSupabaseClient = (
    response: {
        data?: unknown
        error?: unknown
        count?: number
    },
    user: { id: string } | null
) => {
    const result = {
        data: response.data,
        error: response.error,
        count: response.count,
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
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: user } }),
        },
    }
}

describe("Comment Service", () => {
    describe("getCommentsForRecipeWithClient", () => {
        it("should return comments on success", async () => {
            const mockComments = [
                {
                    id: "1",
                    text: "Test comment",
                    profiles: { id: "user-123", display_name: "Test User", avatar: null },
                },
            ]

            const expectedComments = [
                {
                    id: "1",
                    text: "Test comment",
                    profile: { id: "user-123", display_name: "Test User", avatar: null },
                },
            ]
            const client = createMockSupabaseClient({ data: mockComments }, { id: "user-123" })
            const comments = await getCommentsForRecipeWithClient(client as any, "recipe-123")
            expect(comments).toEqual(expectedComments)
        })

        it("should throw an error on failure", async () => {
            const client = createMockSupabaseClient(
                {
                    error: { message: "Fetch failed" },
                },
                { id: "user-123" }
            )
            await expect(
                getCommentsForRecipeWithClient(client as any, "recipe-123")
            ).rejects.toThrow("Failed to fetch comments: Fetch failed")
        })
    })

    describe("createCommentWithClient", () => {
        it("should create a comment on success", async () => {
            const newComment = { id: "2", text: "New comment" }
            const client = createMockSupabaseClient({ data: newComment }, { id: "user-123" })
            const result = await createCommentWithClient(
                client as any,
                { recipe_id: "recipe-123", text: "New comment" },
                { id: "user-123" } as any
            )
            expect(result).toEqual(newComment)
        })

        it("should throw an error on failure", async () => {
            const client = createMockSupabaseClient(
                {
                    error: { message: "Insert failed" },
                },
                { id: "user-123" }
            )
            await expect(
                createCommentWithClient(
                    client as any,
                    { recipe_id: "recipe-123", text: "New comment" },
                    { id: "user-123" } as any
                )
            ).rejects.toThrow("Failed to create comment: Insert failed")
        })
    })

    describe("deleteCommentWithClient", () => {
        it("should not throw on success", async () => {
            const client = createMockSupabaseClient({}, { id: "user-123" })
            await expect(
                deleteCommentWithClient(client as any, "comment-123", {
                    id: "user-123",
                } as any)
            ).resolves.not.toThrow()
        })

        it("should throw an error on failure", async () => {
            const client = createMockSupabaseClient(
                {
                    error: { message: "Delete failed" },
                },
                { id: "user-123" }
            )
            await expect(
                deleteCommentWithClient(client as any, "comment-123", {
                    id: "user-123",
                } as any)
            ).rejects.toThrow("Failed to delete comment: Delete failed")
        })
    })

    describe("getCommentCountWithClient", () => {
        it("should return the comment count on success", async () => {
            const client = createMockSupabaseClient({ count: 5 }, { id: "user-123" })
            const result = await getCommentCountWithClient(client as any, "recipe-123")
            expect(result).toBe(5)
        })

        it("should throw an error on failure", async () => {
            const client = createMockSupabaseClient(
                {
                    error: { message: "Count failed" },
                },
                { id: "user-123" }
            )
            await expect(getCommentCountWithClient(client as any, "recipe-123")).rejects.toThrow(
                "Failed to get comment count: Count failed"
            )
        })
    })
})
