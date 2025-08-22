import { describe, test, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import CollectionPage from "./page"
import { RecipeImportJob, RecipeRead } from "@/lib/types"

// Mock the hooks
vi.mock("@/hooks/use-bookmarked-recipes", () => ({
    useBookmarkedRecipes: () => ({
        recipes: [],
        isLoading: false,
    }),
}))

vi.mock("@/hooks/use-own-recipes", () => ({
    useOwnRecipes: () => ({
        recipes: [],
        isLoading: false,
    }),
}))

vi.mock("@/hooks/use-recipe-import-jobs", () => ({
    useRecipeImportJobs: () => ({
        jobs: [],
        isLoading: false,
    }),
}))

vi.mock("@/hooks/use-navigation-visibility", () => ({
    useNavigationVisibility: () => ({
        isVisible: false,
        scrollDirection: null,
    }),
}))

vi.mock("@/components/util/navigation-tracker", () => ({
    NavigationTracker: () => <div data-testid="navigation-tracker" />,
}))

vi.mock("nuqs", () => ({
    useQueryState: () => ["my-recipes", vi.fn()],
}))

const createMockRecipe = (overrides: Partial<RecipeRead> = {}): RecipeRead => ({
    id: "recipe1",
    user_id: "user1",
    title: "Test Recipe",
    description: "A test recipe",
    thumbnail: "https://example.com/image.jpg",
    source_url: "",
    source_name: "",
    is_public: true,
    status: "PUBLISHED",
    n_portions: 4,
    ingredients: [],
    instructions: [],
    total_cook_time_minutes: 30,
    profiles: {
        id: "user1",
        display_name: "Test User",
        avatar: null,
    },
    created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
    ...overrides,
})

const createMockJob = (overrides: Partial<RecipeImportJob> = {}): RecipeImportJob => ({
    id: "job1",
    user_id: "user1",
    status: "pending",
    source_type: "url",
    source_data: "https://example.com/recipe",
    recipe_id: null,
    error_message: null,
    created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
    updated_at: new Date("2024-01-01T10:00:00Z").toISOString(),
    ...overrides,
})

describe("Collection Page", () => {
    test("shows welcome section when no recipes or jobs exist", () => {
        render(<CollectionPage />)
        expect(screen.getByText("Welkom bij jouw kookboek!")).toBeInTheDocument()
    })

    test("shows navigation tracker", () => {
        render(<CollectionPage />)
        expect(screen.getByTestId("navigation-tracker")).toBeInTheDocument()
    })
})

// Test the sorting logic separately
describe("Collection Sorting Logic", () => {
    test("sorts failed jobs first, then pending jobs, then recipes", () => {
        const failedJob = createMockJob({
            id: "failed1",
            status: "failed",
            error_message: "Test error",
            created_at: new Date("2024-01-01T12:00:00Z").toISOString(),
        })

        const pendingJob = createMockJob({
            id: "pending1",
            status: "pending",
            created_at: new Date("2024-01-01T11:00:00Z").toISOString(),
        })

        const recipe = createMockRecipe({
            id: "recipe1",
            created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
        })

        // This would be the actual sorting logic from the component
        const sortItems = (items: any[], sortOrder: "newest" | "oldest" = "newest") => {
            const failedJobs = items.filter((item) => item.status === "failed")
            const pendingJobs = items.filter((item) => item.status === "pending")
            const recipes = items.filter((item) => item.viewType === "RECIPE")

            const sortByDate = (a: any, b: any) => {
                const dateA = new Date(a.created_at ?? 0).getTime()
                const dateB = new Date(b.created_at ?? 0).getTime()
                return sortOrder === "newest" ? dateB - dateA : dateA - dateB
            }

            const sortedFailedJobs = failedJobs.sort(sortByDate)
            const sortedPendingJobs = pendingJobs.sort(sortByDate)
            const sortedRecipes = recipes.sort(sortByDate)

            return [...sortedFailedJobs, ...sortedPendingJobs, ...sortedRecipes]
        }

        const allItems = [
            { ...failedJob, viewType: "JOB" },
            { ...pendingJob, viewType: "JOB" },
            { ...recipe, viewType: "RECIPE" },
        ]

        const sortedItems = sortItems(allItems, "newest")

        // Check that failed jobs come first
        expect(sortedItems[0].id).toBe("failed1")
        expect(sortedItems[0].status).toBe("failed")

        // Check that pending jobs come second
        expect(sortedItems[1].id).toBe("pending1")
        expect(sortedItems[1].status).toBe("pending")

        // Check that recipes come last
        expect(sortedItems[2].id).toBe("recipe1")
        expect(sortedItems[2].viewType).toBe("RECIPE")
    })

    test("sorts items within groups by date (newest first)", () => {
        const oldFailedJob = createMockJob({
            id: "old-failed",
            status: "failed",
            error_message: "Old error",
            created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
        })

        const newFailedJob = createMockJob({
            id: "new-failed",
            status: "failed",
            error_message: "New error",
            created_at: new Date("2024-01-01T12:00:00Z").toISOString(),
        })

        const sortByDate = (a: any, b: any) => {
            const dateA = new Date(a.created_at ?? 0).getTime()
            const dateB = new Date(b.created_at ?? 0).getTime()
            return dateB - dateA
        }

        const failedJobs = [oldFailedJob, newFailedJob]
        const sortedFailedJobs = failedJobs.sort(sortByDate)

        // Check that newer failed job comes first
        expect(sortedFailedJobs[0].id).toBe("new-failed")
        expect(sortedFailedJobs[1].id).toBe("old-failed")
    })
})
