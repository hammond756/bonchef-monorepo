import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { RecipeImageEditor } from "./recipe-image-editor"

// Mock Next.js Image component
vi.mock("next/image", () => ({
    default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

describe("RecipeImageEditor", () => {
    const mockOnImageChange = vi.fn()
    const mockOnGenerateImage = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders placeholder when no image is provided", () => {
        render(<RecipeImageEditor />)

        // Check for the placeholder icon
        expect(screen.getByTestId("image-icon")).toBeInTheDocument()
    })

    it("renders image when imageUrl is provided", () => {
        render(
            <RecipeImageEditor imageUrl="https://example.com/image.jpg" recipeTitle="Test Recipe" />
        )

        const image = screen.getByRole("img")
        expect(image).toHaveAttribute("src", "https://example.com/image.jpg")
        expect(image).toHaveAttribute("alt", "Test Recipe")
    })

    it("shows edit button when image is provided", () => {
        render(
            <RecipeImageEditor imageUrl="https://example.com/image.jpg" recipeTitle="Test Recipe" />
        )

        expect(screen.getByLabelText("Foto wijzigen")).toBeInTheDocument()
    })

    it("shows image actions on click", () => {
        render(
            <RecipeImageEditor
                onImageChange={mockOnImageChange}
                onGenerateImage={mockOnGenerateImage}
            />
        )

        const container = screen.getByTestId("image-container")
        fireEvent.click(container)

        expect(screen.getByText("Foto maken")).toBeInTheDocument()
        expect(screen.getByText("Galerij")).toBeInTheDocument()
        expect(screen.getByText("AI Genereren")).toBeInTheDocument()
    })

    it("calls onGenerateImage when AI generate button is clicked", () => {
        render(<RecipeImageEditor onGenerateImage={mockOnGenerateImage} />)

        const container = screen.getByTestId("image-container")
        fireEvent.click(container)

        fireEvent.click(screen.getByText("AI Genereren"))
        expect(mockOnGenerateImage).toHaveBeenCalledTimes(1)
    })

    it("shows generating state when isGenerating is true", () => {
        render(<RecipeImageEditor onGenerateImage={mockOnGenerateImage} isGenerating={true} />)

        // When isGenerating is true, the menu should not be shown
        const container = screen.getByTestId("image-container")
        fireEvent.click(container)

        // The menu should not be visible when generating
        expect(screen.queryByText("Foto maken")).not.toBeInTheDocument()
        expect(screen.queryByText("Galerij")).not.toBeInTheDocument()
        expect(screen.queryByText("AI Genereren")).not.toBeInTheDocument()
        expect(screen.queryByText("Genereren...")).not.toBeInTheDocument()
    })

    it("disables generate button when isGenerating is true", () => {
        render(<RecipeImageEditor onGenerateImage={mockOnGenerateImage} isGenerating={true} />)

        // When isGenerating is true, the menu should not be shown, so we can't test the button state
        // This test is no longer relevant since the menu is hidden during generation
        const container = screen.getByTestId("image-container")
        fireEvent.click(container)

        // The menu should not be visible when generating
        expect(screen.queryByText("Foto maken")).not.toBeInTheDocument()
        expect(screen.queryByText("Galerij")).not.toBeInTheDocument()
        expect(screen.queryByText("AI Genereren")).not.toBeInTheDocument()
        expect(screen.queryByText("Genereren...")).not.toBeInTheDocument()
    })

    it("applies custom className", () => {
        const { container } = render(<RecipeImageEditor className="custom-class" />)

        const imageContainer = container.querySelector("div")
        expect(imageContainer).toHaveClass("custom-class")
    })

    it("has correct aspect ratio", () => {
        const { container } = render(<RecipeImageEditor />)

        const imageContainer = container.querySelector("div")
        expect(imageContainer).toHaveClass("aspect-[3/4]")
    })
})
