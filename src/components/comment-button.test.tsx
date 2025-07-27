import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CommentButton } from "./comment-button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@/hooks/use-session"

// Mock the hooks
vi.mock("@/hooks/use-toast")
vi.mock("@/hooks/use-session")
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
        render(
            <CommentButton recipeId="recipe-1" initialCommentCount={5} theme="light" size="md" />
        )

        expect(screen.getByRole("button", { name: "Bekijk reacties" })).toBeInTheDocument()
        expect(screen.getByTestId("comment-recipe-button-count")).toHaveTextContent("5")
    })

    it("calls onCommentClick when clicked", async () => {
        render(
            <CommentButton
                recipeId="recipe-1"
                initialCommentCount={3}
                onCommentClick={mockOnCommentClick}
            />
        )

        const button = screen.getByRole("button", { name: "Bekijk reacties" })
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockOnCommentClick).toHaveBeenCalledTimes(1)
        })
    })

    it("shows auth toast when user is not logged in", async () => {
        ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            session: null,
            isLoading: false,
        })

        render(
            <CommentButton
                recipeId="recipe-1"
                initialCommentCount={2}
                onCommentClick={mockOnCommentClick}
            />
        )

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
        render(<CommentButton recipeId="recipe-1" initialCommentCount={10} showCount={false} />)

        expect(screen.queryByTestId("comment-recipe-button-count")).not.toBeInTheDocument()
    })

    it("formats large numbers correctly", () => {
        render(<CommentButton recipeId="recipe-1" initialCommentCount={1500} />)

        expect(screen.getByTestId("comment-recipe-button-count")).toHaveTextContent("1.5k")
    })
})
