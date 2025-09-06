import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { EditRecipeHeader } from "./edit-recipe-header"
import { RecipeImageEditor } from "./recipe-image-editor"
import { InlineEditableTitle } from "./inline-editable-title"
import { CookingTimeInput } from "./cooking-time-input"
import { ServingsInput } from "./servings-input"
import { AutoResizeTextarea } from "./auto-resize-textarea"
import { SourceField } from "./source-field"
import { IngredientGroupManager } from "./ingredient-group-manager"
import { PreparationSteps } from "./preparation-steps"
import { RecipeEditProvider } from "./recipe-edit-context"
import { Recipe } from "@/lib/types"
import { IngredientGroupsAPI } from "@/hooks/use-ingredient-groups"
import { PreparationStepsAPI } from "@/hooks/use-preparation-steps"

// Mock Next.js Image component
vi.mock("next/image", () => ({
    default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        back: vi.fn(),
        push: vi.fn(),
    }),
}))

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

describe("Recipe Edit Page Components", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("EditRecipeHeader", () => {
        it("renders header with title and save button", () => {
            render(
                <RecipeEditProvider recipe={mockRecipe}>
                    <EditRecipeHeader />
                </RecipeEditProvider>
            )
            expect(screen.getByText("Bewerken")).toBeInTheDocument()
            expect(screen.getByText("Opslaan")).toBeInTheDocument()
        })
    })

    describe("RecipeImageEditor", () => {
        it("renders placeholder when no image is provided", () => {
            render(<RecipeImageEditor />)
            expect(screen.getByTestId("image-icon")).toBeInTheDocument()
        })

        it("renders image when imageUrl is provided", () => {
            render(
                <RecipeImageEditor
                    imageUrl="https://example.com/image.jpg"
                    recipeTitle="Test Recipe"
                />
            )
            const image = screen.getByRole("img")
            expect(image).toHaveAttribute("src", "https://example.com/image.jpg")
        })

        it("shows image actions on click", () => {
            render(<RecipeImageEditor />)
            const container = screen.getByTestId("image-container")
            fireEvent.click(container)
            expect(screen.getByText("Foto maken")).toBeInTheDocument()
            expect(screen.getByText("Galerij")).toBeInTheDocument()
            expect(screen.getByText("AI Genereren")).toBeInTheDocument()
        })

        it("hides menu when isGenerating is true", () => {
            render(<RecipeImageEditor isGenerating={true} />)
            const container = screen.getByTestId("image-container")
            fireEvent.click(container)
            expect(screen.queryByText("Foto maken")).not.toBeInTheDocument()
            expect(screen.queryByText("Galerij")).not.toBeInTheDocument()
            expect(screen.queryByText("AI Genereren")).not.toBeInTheDocument()
        })
    })

    describe("InlineEditableTitle", () => {
        it("renders title input with value", () => {
            render(<InlineEditableTitle value="Test Recipe" onChange={vi.fn()} />)
            expect(screen.getByDisplayValue("Test Recipe")).toBeInTheDocument()
        })

        it("calls onChange when value changes", () => {
            const mockOnChange = vi.fn()
            render(<InlineEditableTitle value="Test Recipe" onChange={mockOnChange} />)
            const input = screen.getByDisplayValue("Test Recipe")
            fireEvent.change(input, { target: { value: "Updated Recipe" } })
            expect(mockOnChange).toHaveBeenCalledWith("Updated Recipe")
        })

        it("shows character count when value is provided", () => {
            render(<InlineEditableTitle value="Test Recipe" onChange={vi.fn()} />)
            expect(screen.getByText("11/100")).toBeInTheDocument()
        })
    })

    describe("CookingTimeInput", () => {
        it("renders cooking time input with clock icon", () => {
            render(<CookingTimeInput value={45} onChange={vi.fn()} />)
            expect(screen.getByDisplayValue("45")).toBeInTheDocument()
            expect(screen.getByText("min")).toBeInTheDocument()
        })

        it("only accepts numeric input", () => {
            const mockOnChange = vi.fn()
            render(<CookingTimeInput value={45} onChange={mockOnChange} />)
            const input = screen.getByDisplayValue("45")
            fireEvent.change(input, { target: { value: "abc" } })
            expect(mockOnChange).not.toHaveBeenCalled()
        })

        it("accepts valid numeric input", () => {
            const mockOnChange = vi.fn()
            render(<CookingTimeInput value={45} onChange={mockOnChange} />)
            const input = screen.getByDisplayValue("45")
            fireEvent.change(input, { target: { value: "60" } })
            expect(mockOnChange).toHaveBeenCalledWith(60)
        })
    })

    describe("ServingsInput", () => {
        it("renders servings input with value", () => {
            render(<ServingsInput value={4} onChange={vi.fn()} />)
            expect(screen.getByDisplayValue("4")).toBeInTheDocument()
            expect(screen.getByText("personen")).toBeInTheDocument()
        })

        it("calls onChange when value changes", () => {
            const mockOnChange = vi.fn()
            render(<ServingsInput value={4} onChange={mockOnChange} />)
            const input = screen.getByDisplayValue("4")
            fireEvent.change(input, { target: { value: "6" } })
            expect(mockOnChange).toHaveBeenCalledWith(6)
        })

        it("only accepts numeric input", () => {
            const mockOnChange = vi.fn()
            render(<ServingsInput value={4} onChange={mockOnChange} />)
            const input = screen.getByDisplayValue("4")
            fireEvent.change(input, { target: { value: "abc" } })
            expect(mockOnChange).not.toHaveBeenCalled()
        })
    })

    describe("AutoResizeTextarea", () => {
        it("renders textarea with value", () => {
            render(
                <AutoResizeTextarea
                    value="Test description"
                    onChange={vi.fn()}
                    placeholder="Enter description"
                />
            )
            expect(screen.getByDisplayValue("Test description")).toBeInTheDocument()
        })

        it("calls onChange when value changes", () => {
            const mockOnChange = vi.fn()
            render(
                <AutoResizeTextarea
                    value=""
                    onChange={mockOnChange}
                    placeholder="Enter description"
                />
            )
            const textarea = screen.getByPlaceholderText("Enter description")
            fireEvent.change(textarea, { target: { value: "New description" } })
            expect(mockOnChange).toHaveBeenCalledWith("New description")
        })

        it("shows character count when maxLength is provided", () => {
            render(<AutoResizeTextarea value="Test" onChange={vi.fn()} maxLength={100} />)
            expect(screen.getByText("4/100")).toBeInTheDocument()
        })
    })

    describe("SourceField", () => {
        it("renders source field with label", () => {
            render(<SourceField value="" onChange={vi.fn()} />)
            expect(screen.getByText("Bron van het recept")).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText("Bijv. Oma's kookboek, AllRecipes.com, etc.")
            ).toBeInTheDocument()
        })

        it("calls onChange when value changes", () => {
            const mockOnChange = vi.fn()
            render(<SourceField value="" onChange={mockOnChange} />)
            const input = screen.getByPlaceholderText("Bijv. Oma's kookboek, AllRecipes.com, etc.")
            fireEvent.change(input, { target: { value: "Test source" } })
            expect(mockOnChange).toHaveBeenCalledWith("Test source")
        })
    })

    describe("IngredientGroupManager", () => {
        const mockGroups = [
            {
                id: "1",
                title: "Test Group",
                ingredients: [{ id: "1", quantity: 100, unit: "g", name: "Test Ingredient" }],
            },
        ]
        const mockApi: IngredientGroupsAPI = {
            addGroup: vi.fn(),
            deleteGroup: vi.fn(),
            updateGroupTitle: vi.fn(),
            reorderGroup: vi.fn(),
            toggleGroup: vi.fn(),
            addIngredient: vi.fn(),
            deleteIngredient: vi.fn(),
            updateIngredient: vi.fn(),
            reorderIngredient: vi.fn(),
        }

        it("renders ingredient groups", () => {
            render(<IngredientGroupManager groups={mockGroups} isExpanded={[true]} api={mockApi} />)
            expect(screen.getByDisplayValue("Test Group")).toBeInTheDocument()
        })

        it("adds new group when add group button is clicked", () => {
            render(<IngredientGroupManager groups={mockGroups} isExpanded={[true]} api={mockApi} />)
            fireEvent.click(screen.getByText("Groep toevoegen"))
            expect(mockApi.addGroup).toHaveBeenCalled()
        })
    })

    describe("PreparationSteps", () => {
        const mockSteps = [
            { id: "1", content: "Step 1" },
            { id: "2", content: "Step 2" },
        ]
        const mockApi: PreparationStepsAPI = {
            addStep: vi.fn(),
            deleteStep: vi.fn(),
            updateStep: vi.fn(),
            reorderStep: vi.fn(),
        }

        it("renders preparation steps", () => {
            render(<PreparationSteps steps={mockSteps} api={mockApi} />)
            expect(screen.getByText("Bereidingswijze")).toBeInTheDocument()
            expect(screen.getByDisplayValue("Step 1")).toBeInTheDocument()
            expect(screen.getByDisplayValue("Step 2")).toBeInTheDocument()
        })

        it("adds new step when add button is clicked", () => {
            render(<PreparationSteps steps={mockSteps} api={mockApi} />)
            const addButtons = screen.getAllByText("Stap toevoegen")
            fireEvent.click(addButtons[0]) // Click the first button (header button)
            expect(mockApi.addStep).toHaveBeenCalled()
        })

        it("deletes step when delete button is clicked", () => {
            render(<PreparationSteps steps={mockSteps} api={mockApi} />)
            const deleteButtons = screen
                .getAllByRole("button")
                .filter((button) => button.querySelector('svg[class*="lucide-trash2"]'))
            fireEvent.click(deleteButtons[0])
            expect(mockApi.deleteStep).toHaveBeenCalledWith("1")
        })
    })
})
