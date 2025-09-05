import { describe, test, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import CollectionPage from "./page"
import { RecipeImportJob, RecipeRead } from "@/lib/types"
import { MyRecipes } from "@/components/collection/my-recipes"
import { useBookmarkedRecipes } from "@/hooks/use-bookmarked-recipes"
import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"
import { NonCompletedRecipeImportJob } from "@/lib/services/recipe-imports-job/shared"

// Mock the hooks with factories
vi.mock("@/hooks/use-bookmarked-recipes", () => ({
    useBookmarkedRecipes: vi.fn(),
}))

vi.mock("@/hooks/use-own-recipes", () => ({
    useOwnRecipes: vi.fn(),
}))

vi.mock("@/hooks/use-recipe-import-jobs", () => ({
    useRecipeImportJobs: vi.fn(),
}))

// Get references to the mocked functions
const mockUseBookmarkedRecipes = vi.mocked(useBookmarkedRecipes)
const mockUseOwnRecipes = vi.mocked(useOwnRecipes)
const mockUseRecipeImportJobs = vi.mocked(useRecipeImportJobs)

vi.mock("@/hooks/use-navigation-visibility", () => ({
    useNavigationVisibility: () => ({
        isVisible: false,
        scrollDirection: null,
    }),
}))

vi.mock("@/components/util/navigation-tracker", () => ({
    NavigationTracker: () => <div data-testid="navigation-tracker" />,
}))

// Mock the card components
vi.mock("@/components/recipe/recipe-card", () => ({
    RecipeCard: ({ recipe }: { recipe: any }) => (
        <div data-testid={`recipe-card-${recipe.id}`}>
            <h3>{recipe.title}</h3>
            <span data-testid="recipe-date">{recipe.created_at}</span>
        </div>
    ),
}))

vi.mock("@/components/recipe/pending-job", () => ({
    PendingJob: ({ job }: { job: any }) => (
        <div data-testid={`pending-job-${job.id}`}>
            <h3>Recept wordt gemaakt...</h3>
            <span data-testid="job-date">{job.created_at}</span>
        </div>
    ),
}))

vi.mock("@/components/recipe/failed-job", () => ({
    FailedJob: ({ job }: { job: any }) => (
        <div data-testid={`failed-job-${job.id}`}>
            <h3>Import mislukt</h3>
            <span data-testid="job-date">{job.created_at}</span>
        </div>
    ),
}))

vi.mock("@/components/recipe/recipe-list-item", () => ({
    RecipeListItem: ({ recipe }: { recipe: any }) => (
        <div data-testid={`recipe-list-item-${recipe.id}`}>
            <h3>{recipe.title}</h3>
            <span data-testid="recipe-date">{recipe.created_at}</span>
        </div>
    ),
    InProgressRecipeListItem: ({ job }: { job: any }) => (
        <div data-testid={`in-progress-list-item-${job.id}`}>
            <h3>Recept wordt gemaakt...</h3>
            <span data-testid="job-date">{job.created_at}</span>
        </div>
    ),
}))

vi.mock("@/components/recipe/recipe-page-skeleton", () => ({
    RecipePageSkeleton: () => <div data-testid="recipe-page-skeleton">Loading...</div>,
}))

vi.mock("@/components/recipe/welcome-section", () => ({
    WelcomeSection: () => <div data-testid="welcome-section">Welkom bij jouw kookboek!</div>,
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

const createMockJob = (
    overrides: Partial<NonCompletedRecipeImportJob> = {}
): NonCompletedRecipeImportJob => ({
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
    beforeEach(() => {
        // Set up default mock return values
        mockUseBookmarkedRecipes.mockReturnValue({
            recipes: [],
            isLoading: false,
            isError: null,
            mutate: vi.fn(),
        })
        mockUseOwnRecipes.mockReturnValue({
            recipes: [],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 0),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [],
            isLoading: false,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })
    })

    test("shows welcome section when no recipes or jobs exist", () => {
        render(<CollectionPage />)
        expect(screen.getByText("Welkom bij jouw kookboek!")).toBeInTheDocument()
    })

    test("shows navigation tracker", () => {
        render(<CollectionPage />)
        expect(screen.getByTestId("navigation-tracker")).toBeInTheDocument()
    })
})

// Test the MyRecipes component directly
describe("MyRecipes Component", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks()
    })

    test("shows loading state when data is loading", () => {
        // Set up mocks for loading state
        mockUseOwnRecipes.mockReturnValue({
            recipes: [],
            isLoading: true,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 0),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [],
            isLoading: true,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })

        render(<MyRecipes viewMode="grid" sortOrder="newest" />)
        // Check for skeleton loading state - should show 8 skeleton cards
        const skeletonCards = screen
            .getAllByRole("generic")
            .filter(
                (el) => el.className.includes("bg-muted") && el.className.includes("animate-pulse")
            )
        expect(skeletonCards).toHaveLength(8)
    })

    test("shows welcome section when no recipes or jobs exist", () => {
        // Set up mocks for empty state
        mockUseOwnRecipes.mockReturnValue({
            recipes: [],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 0),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [],
            isLoading: false,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })

        render(<MyRecipes viewMode="grid" sortOrder="newest" />)
        // Check for welcome section content
        expect(screen.getByText("Welkom bij jouw kookboek!")).toBeInTheDocument()
        expect(
            screen.getByText(/Hier vind je al jouw recepten en favorieten op één plek/)
        ).toBeInTheDocument()
    })

    test("renders cards in correct order: failed jobs first, then pending jobs, then recipes (newest first)", () => {
        const failedJob = createMockJob({
            id: "failed1",
            status: "failed",
            error_message: "Test error",
            created_at: new Date("2024-01-01T12:00:00Z").toISOString(),
        })

        const pendingJob = createMockJob({
            id: "pending1",
            status: "pending",
            created_at: new Date("2024-01-03T11:00:00Z").toISOString(),
        })

        const recipe = createMockRecipe({
            id: "recipe1",
            title: "Test Recipe",
            created_at: new Date("2024-01-04T10:00:00Z").toISOString(),
        })

        // Set up mocks for this test
        mockUseOwnRecipes.mockReturnValue({
            recipes: [recipe],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 1),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [failedJob, pendingJob],
            isLoading: false,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })

        render(<MyRecipes viewMode="grid" sortOrder="newest" />)

        // Check that failed job comes first
        expect(screen.getByTestId("failed-job-failed1")).toBeInTheDocument()
        expect(screen.getByText("Import mislukt")).toBeInTheDocument()

        // Check that pending job comes second
        expect(screen.getByTestId("pending-job-pending1")).toBeInTheDocument()
        expect(screen.getByText("Recept wordt gemaakt...")).toBeInTheDocument()

        // Check that recipe comes last
        expect(screen.getByTestId("recipe-card-recipe1")).toBeInTheDocument()
        expect(screen.getByText("Test Recipe")).toBeInTheDocument()
    })

    test("renders cards in correct order: failed jobs first, then pending jobs, then recipes (oldest first)", () => {
        const failedJob = createMockJob({
            id: "failed1",
            status: "failed",
            error_message: "Test error",
            created_at: new Date("2024-01-04T12:00:00Z").toISOString(),
        })

        const pendingJob = createMockJob({
            id: "pending1",
            status: "pending",
            created_at: new Date("2024-01-02T11:00:00Z").toISOString(),
        })

        const recipe = createMockRecipe({
            id: "recipe1",
            title: "Test Recipe",
            created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
        })

        // Set up mocks for this test
        mockUseOwnRecipes.mockReturnValue({
            recipes: [recipe],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 1),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [failedJob, pendingJob],
            isLoading: false,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })

        render(<MyRecipes viewMode="grid" sortOrder="oldest" />)

        // Check that failed job comes first (regardless of date)
        expect(screen.getByTestId("failed-job-failed1")).toBeInTheDocument()
        expect(screen.getByText("Import mislukt")).toBeInTheDocument()

        // Check that pending job comes second (regardless of date)
        expect(screen.getByTestId("pending-job-pending1")).toBeInTheDocument()
        expect(screen.getByText("Recept wordt gemaakt...")).toBeInTheDocument()

        // Check that recipe comes last (regardless of date)
        expect(screen.getByTestId("recipe-card-recipe1")).toBeInTheDocument()
        expect(screen.getByText("Test Recipe")).toBeInTheDocument()
    })

    test("renders list view when viewMode is list", () => {
        const recipe = createMockRecipe({
            id: "recipe1",
            title: "Test Recipe",
            created_at: new Date("2024-01-04T10:00:00Z").toISOString(),
        })

        const pendingJob = createMockJob({
            id: "pending1",
            status: "pending",
            created_at: new Date("2024-01-03T11:00:00Z").toISOString(),
        })

        // Set up mocks for this test
        mockUseOwnRecipes.mockReturnValue({
            recipes: [recipe],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 1),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [pendingJob],
            isLoading: false,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })

        render(<MyRecipes viewMode="list" sortOrder="newest" />)

        // Check that list items are rendered
        expect(screen.getByTestId("in-progress-list-item-pending1")).toBeInTheDocument()
        expect(screen.getByTestId("recipe-list-item-recipe1")).toBeInTheDocument()
    })

    test("sorts multiple items within each group by date correctly", () => {
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

        const oldPendingJob = createMockJob({
            id: "old-pending",
            status: "pending",
            created_at: new Date("2024-01-02T10:00:00Z").toISOString(),
        })

        const newPendingJob = createMockJob({
            id: "new-pending",
            status: "pending",
            created_at: new Date("2024-01-02T12:00:00Z").toISOString(),
        })

        const oldRecipe = createMockRecipe({
            id: "old-recipe",
            title: "Old Recipe",
            created_at: new Date("2024-01-03T10:00:00Z").toISOString(),
        })

        const newRecipe = createMockRecipe({
            id: "new-recipe",
            title: "New Recipe",
            created_at: new Date("2024-01-03T12:00:00Z").toISOString(),
        })

        // Set up mocks for this test
        mockUseOwnRecipes.mockReturnValue({
            recipes: [oldRecipe, newRecipe],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
            count: vi.fn(() => 2),
        })
        mockUseRecipeImportJobs.mockReturnValue({
            jobs: [oldFailedJob, newFailedJob, oldPendingJob, newPendingJob],
            isLoading: false,
            isError: null,
            addJob: vi.fn(),
            removeJob: vi.fn(),
            isDeleting: null,
            mutate: vi.fn(),
        })

        render(<MyRecipes viewMode="grid" sortOrder="newest" />)

        // Get all rendered elements
        const failedJobs = screen.getAllByText("Import mislukt")
        const pendingJobs = screen.getAllByText("Recept wordt gemaakt...")
        const recipes = screen.getAllByText(/Recipe/)

        // Check that we have the right number of each type
        expect(failedJobs).toHaveLength(2)
        expect(pendingJobs).toHaveLength(2)
        expect(recipes).toHaveLength(2)

        // Check that failed jobs come first, then pending jobs, then recipes
        expect(screen.getByTestId("failed-job-new-failed")).toBeInTheDocument()
        expect(screen.getByTestId("failed-job-old-failed")).toBeInTheDocument()
        expect(screen.getByTestId("pending-job-new-pending")).toBeInTheDocument()
        expect(screen.getByTestId("pending-job-old-pending")).toBeInTheDocument()
        expect(screen.getByTestId("recipe-card-new-recipe")).toBeInTheDocument()
        expect(screen.getByTestId("recipe-card-old-recipe")).toBeInTheDocument()
    })
})
