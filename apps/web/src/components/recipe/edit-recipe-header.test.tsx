import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { EditRecipeHeader } from "./edit-recipe-header"
import { useRouter } from "next/navigation"
import { RecipeEditProvider } from "./recipe-edit-context"
import { Recipe } from "@/lib/types"

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

const mockRouter = {
    back: vi.fn(),
}

const mockRecipe: Recipe = {
    user_id: "1",
    profiles: {
        id: "1",
        display_name: "Test User",
    },
    source_url: "",
    id: "1",
    title: "Test Recipe",
    description: "Test Description",
    ingredients: [],
    instructions: [],
    thumbnail: "",
    source_name: "Test Source",
    total_cook_time_minutes: 0,
    n_portions: 0,
    is_public: false,
    created_at: new Date().toISOString(),
}

describe("EditRecipeHeader", () => {
    beforeEach(() => {
        ;(useRouter as any).mockReturnValue(mockRouter)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it("renders header with title and buttons", () => {
        render(<EditRecipeHeader />)

        expect(screen.getByText("Bewerken")).toBeInTheDocument()
        expect(screen.getByLabelText("Opslaan")).toBeInTheDocument()
        expect(screen.getByLabelText("Terug naar recept")).toBeInTheDocument()
    })

    it("disables save button when isDisabled is true", () => {
        vi.mock("@/components/recipe/recipe-edit-context", () => ({
            useRecipeEditContext: () => ({
                canSave: false,
            }),
        }))
        render(<EditRecipeHeader />)

        const saveButton = screen.getByLabelText("Opslaan").closest("button")
        expect(saveButton).toBeDisabled()
    })

    it("shows loading state when isSaving is true", () => {
        vi.mock("@/components/recipe/recipe-edit-context", () => ({
            useRecipeEditContext: () => ({
                isSaving: true,
            }),
        }))
        render(<EditRecipeHeader />)

        expect(screen.getByText("Opslaan...")).toBeInTheDocument()
        expect(screen.queryByText("Opslaan")).not.toBeInTheDocument()
    })

    it("disables save button when isSaving is true", () => {
        vi.mock("@/components/recipe/recipe-edit-context", () => ({
            useRecipeEditContext: () => ({
                isSaving: true,
            }),
        }))

        render(<EditRecipeHeader />)

        const saveButton = screen.getByLabelText("Opslaan").closest("button")
        expect(saveButton).toBeDisabled()
    })
})
