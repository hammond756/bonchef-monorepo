import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { RecipeInformationSection } from "./recipe-information-section"

describe("RecipeInformationSection", () => {
    const defaultProps = {
        imageUrl: "https://example.com/image.jpg",
        onImageChange: vi.fn(),
        onGenerateImage: vi.fn(),
        onTakePhoto: vi.fn(),
        isGenerating: false,
        title: "Test Recipe",
        onTitleChange: vi.fn(),
        cookingTime: 30,
        onCookingTimeChange: vi.fn(),
        servings: 4,
        onServingsChange: vi.fn(),
        description: "Test description",
        onDescriptionChange: vi.fn(),
        source: "Test Source",
        onSourceChange: vi.fn(),
        sourceUrl: "https://example.com/recipe",
        onSourceUrlChange: vi.fn(),
        errors: {},
    }

    it("should render source URL input field", () => {
        render(<RecipeInformationSection {...defaultProps} />)

        const sourceUrlInput = screen.getByLabelText("Link naar de bron")
        expect(sourceUrlInput).toBeInTheDocument()
        expect(sourceUrlInput).toHaveValue("https://example.com/recipe")
    })

    it("should call onSourceUrlChange when source URL input changes", () => {
        const onSourceUrlChange = vi.fn()
        render(<RecipeInformationSection {...defaultProps} onSourceUrlChange={onSourceUrlChange} />)

        const sourceUrlInput = screen.getByLabelText("Link naar de bron")
        fireEvent.change(sourceUrlInput, { target: { value: "https://new-url.com" } })

        expect(onSourceUrlChange).toHaveBeenCalledWith("https://new-url.com")
    })

    it("should display source URL error when provided", () => {
        const errors = {
            sourceUrl: "Ongeldige URL",
        }
        render(<RecipeInformationSection {...defaultProps} errors={errors} />)

        expect(screen.getByText("Ongeldige URL")).toBeInTheDocument()
    })

    it("should display source name error when provided", () => {
        const errors = {
            sourceName: "Bron naam is verplicht wanneer een URL wordt ingevuld",
        }
        render(<RecipeInformationSection {...defaultProps} errors={errors} />)

        expect(
            screen.getByText("Bron naam is verplicht wanneer een URL wordt ingevuld")
        ).toBeInTheDocument()
    })

    it("should have correct placeholder for source URL input", () => {
        render(<RecipeInformationSection {...defaultProps} />)

        const sourceUrlInput = screen.getByLabelText("Link naar de bron")
        expect(sourceUrlInput).toHaveAttribute("placeholder", "https://example.com/recept")
    })

    it("should have correct input type for source URL", () => {
        render(<RecipeInformationSection {...defaultProps} />)

        const sourceUrlInput = screen.getByLabelText("Link naar de bron")
        expect(sourceUrlInput).toHaveAttribute("type", "url")
    })

    it("should have maxLength attribute for source URL input", () => {
        render(<RecipeInformationSection {...defaultProps} />)

        const sourceUrlInput = screen.getByLabelText("Link naar de bron")
        expect(sourceUrlInput).toHaveAttribute("maxLength", "500")
    })
})
