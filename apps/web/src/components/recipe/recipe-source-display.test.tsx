import { render, screen } from "@testing-library/react"
import { RecipeSourceDisplay } from "./recipe-source-display"
import { Recipe } from "@/lib/types"

// Mock Next.js Link component
vi.mock("next/link", () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

// Mock getHostnameFromUrl utility
vi.mock("@/lib/utils", () => ({
    getHostnameFromUrl: (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return url
        }
    },
}))

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    id: "1",
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
    ...overrides,
})

describe("RecipeSourceDisplay", () => {
    test("shows external source name when both source_name and source_url are available", () => {
        const recipe = createMockRecipe({
            source_name: "Allerhande",
            source_url: "https://allerhande.nl/recipe",
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("Allerhande")).toBeInTheDocument()
        expect(screen.getByTestId("external-source-link")).toHaveAttribute(
            "href",
            "https://allerhande.nl/recipe"
        )
        expect(screen.getByTestId("external-source-link")).toHaveAttribute("target", "_blank")
    })

    test("shows hostname when source_url exists but source_name is missing", () => {
        const recipe = createMockRecipe({
            source_name: "",
            source_url: "https://recipetineats.com/recipe",
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("recipetineats.com")).toBeInTheDocument()
        expect(screen.getByTestId("hostname-source-link")).toHaveAttribute(
            "href",
            "https://recipetineats.com/recipe"
        )
        expect(screen.getByTestId("hostname-source-link")).toHaveAttribute("target", "_blank")
    })

    test("shows hostname when source_name is 'BonChef' but source_url exists", () => {
        const recipe = createMockRecipe({
            source_name: "BonChef",
            source_url: "https://example.com/recipe",
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("example.com")).toBeInTheDocument()
        expect(screen.getByTestId("hostname-source-link")).toHaveAttribute(
            "href",
            "https://example.com/recipe"
        )
    })

    test("shows user profile when no external source_url", () => {
        const recipe = createMockRecipe({
            source_url: "",
            source_name: "",
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("Test User")).toBeInTheDocument()
        expect(screen.getByTestId("user-profile-link")).toHaveAttribute("href", "/profiles/~user1")
    })

    test("shows user profile when source_url is BonChef", () => {
        const recipe = createMockRecipe({
            source_url: "https://app.bonchef.io",
            source_name: "BonChef",
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("Test User")).toBeInTheDocument()
        expect(screen.getByTestId("user-profile-link")).toHaveAttribute("href", "/profiles/~user1")
    })

    test("shows anonymous user when no display_name", () => {
        const recipe = createMockRecipe({
            source_url: "",
            source_name: "",
            profiles: {
                id: "user1",
                display_name: null,
                avatar: null,
            },
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("een anonieme chef")).toBeInTheDocument()
        expect(screen.getByTestId("user-profile-link")).toHaveAttribute("href", "/profiles/~user1")
    })

    test("handles malformed URLs gracefully", () => {
        const recipe = createMockRecipe({
            source_name: "",
            source_url: "not-a-valid-url",
        })

        render(<RecipeSourceDisplay recipe={recipe} />)

        expect(screen.getByText("van")).toBeInTheDocument()
        expect(screen.getByText("not-a-valid-url")).toBeInTheDocument()
        expect(screen.getByTestId("hostname-source-link")).toHaveAttribute(
            "href",
            "not-a-valid-url"
        )
    })
})
