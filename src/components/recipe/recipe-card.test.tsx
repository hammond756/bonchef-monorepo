import { render, screen } from "@testing-library/react"
import { RecipeCard, InProgressRecipeCard } from "@/components/recipe/recipe-card"
import { Recipe, RecipeImportJob } from "@/lib/types"
import { vi } from "vitest"

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/hooks/use-user", () => ({
    useUser: () => ({
        user: {
            id: "1",
            email: "test@example.com",
        },
        isLoading: false,
    }),
}))

const mockRecipe: Recipe = {
    id: "1",
    user_id: "user1",
    title: "Test Recipe",
    description: "A delicious test recipe",
    thumbnail: "https://placekitten.com/200/300",
    profiles: {
        id: "1",
        display_name: "testuser",
        avatar: "https://placekitten.com/50/50",
    },
    status: "PUBLISHED",
    n_portions: 4,
    ingredients: [],
    instructions: [],
    total_cook_time_minutes: 30,
    is_bookmarked_by_current_user: false,
    bookmark_count: 0,
    source_url: "",
    source_name: "",
    is_public: true,
}

const mockImportJob: RecipeImportJob = {
    id: "job1",
    user_id: "user1",
    source_type: "url",
    source_data: "https://example.com/recipe",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recipe_id: null,
    error_message: null,
}

describe("RecipeCard", () => {
    test("renders published recipe card correctly", () => {
        render(<RecipeCard recipe={mockRecipe} />)
        expect(screen.getByText("Test Recipe")).toBeInTheDocument()
        expect(screen.queryByText("Concept")).not.toBeInTheDocument()
        const link = screen.getByRole("link")
        expect(link).toHaveAttribute("href", "/recipes/1")
    })

    test("renders draft recipe card correctly", () => {
        const draftRecipe = { ...mockRecipe, status: "DRAFT" as const }
        render(<RecipeCard recipe={draftRecipe} />)
        expect(screen.getByText("Test Recipe")).toBeInTheDocument()
        expect(screen.getByText("Concept")).toBeInTheDocument()
        const link = screen.getByRole("link")
        expect(link).toHaveAttribute("href", "/edit/1")
    })
})

describe("InProgressRecipeCard", () => {
    test("renders importing recipe card correctly", () => {
        render(<InProgressRecipeCard job={mockImportJob} />)
        expect(screen.getByText("Recept wordt gemaakt...")).toBeInTheDocument()
        expect(screen.getByText("example.com")).toBeInTheDocument()
    })
})
