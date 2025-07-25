import { describe, it, expect, vi, beforeEach } from "vitest"
import {
    getCommentsForRecipe,
    createComment,
    deleteComment,
    getCommentCount,
} from "./comment-service"
import { createClient } from "@/utils/supabase/server"

// Mock the Supabase client
vi.mock("@/utils/supabase/server", () => ({
    createClient: vi.fn(),
}))

describe("Comment Service", () => {
    const mockSupabase = {
        from: vi.fn(),
        auth: {
            getUser: vi.fn(),
        },
    }

    beforeEach(() => {
        vi.clearAllMocks()
        ;(createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase)
    })

    describe("getCommentsForRecipe", () => {
        it("should fetch comments successfully", async () => {
            const mockComments = [
                {
                    id: "1",
                    recipe_id: "recipe-1",
                    user_id: "user-1",
                    text: "Great recipe!",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z",
                    profiles: {
                        id: "user-1",
                        display_name: "Test User",
                        avatar: null,
                    },
                },
            ]

            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                        data: mockComments,
                        error: null,
                    }),
                }),
            })

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            })

            const result = await getCommentsForRecipe("recipe-1")

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(mockComments)
            }
            expect(mockSupabase.from).toHaveBeenCalledWith("comments")
        })

        it("should handle database errors", async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "Database error" },
                    }),
                }),
            })

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            })

            const result = await getCommentsForRecipe("recipe-1")

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain("Failed to fetch comments")
            }
        })
    })

    describe("createComment", () => {
        it("should create comment successfully", async () => {
            const mockUser = { id: "user-1" }
            const mockComment = {
                id: "1",
                recipe_id: "recipe-1",
                user_id: "user-1",
                text: "Great recipe!",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
                profiles: {
                    id: "user-1",
                    display_name: "Test User",
                    avatar: null,
                },
            }

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })

            const mockInsert = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockComment,
                        error: null,
                    }),
                }),
            })

            mockSupabase.from.mockReturnValue({
                insert: mockInsert,
            })

            const result = await createComment({
                recipe_id: "recipe-1",
                text: "Great recipe!",
            })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(mockComment)
            }
        })

        it("should handle unauthenticated user", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            })

            const result = await createComment({
                recipe_id: "recipe-1",
                text: "Great recipe!",
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe("User not authenticated")
            }
        })
    })

    describe("deleteComment", () => {
        it("should delete comment successfully", async () => {
            const mockUser = { id: "user-1" }

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })

            const mockDelete = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            })

            mockSupabase.from.mockReturnValue({
                delete: mockDelete,
            })

            const result = await deleteComment("comment-1")

            expect(result.success).toBe(true)
        })

        it("should handle unauthenticated user", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            })

            const result = await deleteComment("comment-1")

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe("User not authenticated")
            }
        })
    })

    describe("getCommentCount", () => {
        it("should get comment count successfully", async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    count: 5,
                    error: null,
                }),
            })

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            })

            const result = await getCommentCount("recipe-1")

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe(5)
            }
        })

        it("should return 0 when no comments exist", async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    count: null,
                    error: null,
                }),
            })

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            })

            const result = await getCommentCount("recipe-1")

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe(0)
            }
        })
    })
})
