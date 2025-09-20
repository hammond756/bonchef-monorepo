import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CommentButton } from "./comment-button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@/hooks/use-session"
import { useCommentCount } from "@/hooks/use-comment-count"

// Mock the hooks
vi.mock("@/hooks/use-toast")
vi.mock("@/hooks/use-session")
vi.mock("@/hooks/use-comment-count")
vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}))

describe("CommentButton", () => {
    const mockToast = vi.fn()
    const mockOnCommentClick = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ toast: mockToast })
        ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            session: { user: { id: "user-1" } },
            isLoading: false,
        })
    })

    it("renders comment button with count", () => {
        ;(useCommentCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            count: 5,
            mutate: vi.fn(),
        })

        render(<CommentButton recipeId="recipe-1" theme="light" size="md" />)

        expect(screen.getByRole("button", { name: "Bekijk reacties" })).toBeInTheDocument()
        expect(screen.getByTestId("comment-recipe-button-count")).toHaveTextContent("5")
    })

    it("calls onCommentClick when clicked", async () => {
        ;(useCommentCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            count: 3,
            mutate: vi.fn(),
        })

        render(<CommentButton recipeId="recipe-1" onCommentClick={mockOnCommentClick} />)

        const button = screen.getByRole("button", { name: "Bekijk reacties" })
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockOnCommentClick).toHaveBeenCalledTimes(1)
        })
    })

    it("shows auth toast when user is not logged in", async () => {
        ;(useCommentCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            count: 2,
            mutate: vi.fn(),
        })
        ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            session: null,
            isLoading: false,
        })

        render(<CommentButton recipeId="recipe-1" onCommentClick={mockOnCommentClick} />)

        const button = screen.getByRole("button", { name: "Bekijk reacties" })
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Welkom!",
                description: "Om te kunnen reageren kan je een gratis account aanmaken",
            })
        })
    })

    it("hides count when showCount is false", () => {
        ;(useCommentCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            count: 10,
            mutate: vi.fn(),
        })

        render(<CommentButton recipeId="recipe-1" showCount={false} />)

        expect(screen.queryByTestId("comment-recipe-button-count")).not.toBeInTheDocument()
    })

    it("formats large numbers correctly", () => {
        ;(useCommentCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            count: 1500,
            mutate: vi.fn(),
        })

        render(<CommentButton recipeId="recipe-1" />)

        expect(screen.getByTestId("comment-recipe-button-count")).toHaveTextContent("1.5k")
    })
})
