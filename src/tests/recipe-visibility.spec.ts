import { test, expect } from "./fixtures"
import { createRecipeSlug } from "./utils/recipe-helpers"

// Test suite for recipe visibility features
test.describe("Recipe visibility features", () => {
    let publicRecipeId: string
    let privateRecipeId: string

    // Create test recipes before all tests with first user
    test.beforeAll(async ({ authenticatedPage: page, baseURL }) => {
        // Create a public test recipe
        const publicResponse = await page.request.post(`${baseURL}/api/save-recipe`, {
            data: {
                title: "Public Test Recipe",
                description: "A public recipe for testing visibility",
                n_portions: 2,
                ingredients: [
                    {
                        name: "no_group",
                        ingredients: [
                            {
                                quantity: { type: "range", low: 200, high: 200 },
                                unit: "gram",
                                description: "pasta",
                            },
                        ],
                    },
                ],
                instructions: ["Cook the pasta"],
                thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAA",
                total_cook_time_minutes: 10,
                source_url: "http://localhost:3000",
                source_name: "Public Test Recipe",
                is_public: true,
            },
        })

        const publicData = await publicResponse.json()
        publicRecipeId = publicData.recipe.id

        // Create a private test recipe
        const privateResponse = await page.request.post(`${baseURL}/api/save-recipe`, {
            data: {
                title: "Private Test Recipe",
                description: "A private recipe for testing visibility",
                n_portions: 2,
                ingredients: [
                    {
                        name: "no_group",
                        ingredients: [
                            {
                                quantity: { type: "range", low: 200, high: 200 },
                                unit: "gram",
                                description: "rice",
                            },
                        ],
                    },
                ],
                instructions: ["Cook the rice"],
                thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAA",
                total_cook_time_minutes: 15,
                source_url: "http://localhost:3000",
                source_name: "Private Test Recipe",
                is_public: false,
            },
        })

        const privateData = await privateResponse.json()
        privateRecipeId = privateData.recipe.id
    })

    // Test recipe visibility for first user (owner)
    test.describe("First user (owner) recipe visibility", () => {
        test("can view own public recipe", async ({ authenticatedPage: page, baseURL }) => {
            // Access public recipe
            await page.goto(
                `${baseURL}/recipes/${createRecipeSlug("Public Test Recipe", publicRecipeId)}`
            )

            // Verify recipe is visible
            await expect(page.getByText("Public Test Recipe")).toBeVisible()
            await expect(page.getByText("A public recipe for testing visibility")).toBeVisible()

            // Verify public badge is visible
            await expect(page.getByText("Openbaar")).toBeVisible()
        })

        test("can view own private recipe", async ({ authenticatedPage: page, baseURL }) => {
            // Access private recipe
            await page.goto(
                `${baseURL}/recipes/${createRecipeSlug("Private Test Recipe", privateRecipeId)}`
            )

            // Verify recipe is visible
            await expect(page.getByText("Private Test Recipe")).toBeVisible()
            await expect(page.getByText("A private recipe for testing visibility")).toBeVisible()

            // Verify private badge is visible
            await expect(page.getByText("Privé")).toBeVisible()
        })
    })

    // Test recipe visibility for second user (non-owner)
    test.describe("Second user (non-owner) recipe visibility", () => {
        test("can view first user's public recipe", async ({ secondUserPage: page, baseURL }) => {
            // Access first user's public recipe
            await page.goto(
                `${baseURL}/recipes/${createRecipeSlug("Public Test Recipe", publicRecipeId)}`
            )

            // Verify recipe is visible
            await expect(page.getByText("Public Test Recipe")).toBeVisible()
            await expect(page.getByText("A public recipe for testing visibility")).toBeVisible()

            // Verify public badge is visible
            await expect(page.getByText("Openbaar")).toBeVisible()
        })

        test("cannot view first user's private recipe", async ({
            secondUserPage: page,
            baseURL,
        }) => {
            // Try to access first user's private recipe
            await page.goto(
                `${baseURL}/recipes/${createRecipeSlug("Private Test Recipe", privateRecipeId)}`
            )

            // Verify recipe not found message
            await expect(page.getByText("Recept niet gevonden")).toBeVisible()
        })
    })

    // Test recipe visibility for anonymous users
    test.describe("Anonymous user recipe visibility", () => {
        test("can view public recipe", async ({ unauthenticatedPage: page, baseURL }) => {
            // Try to access public recipe
            await page.goto(
                `${baseURL}/recipes/${createRecipeSlug("Public Test Recipe", publicRecipeId)}`
            )

            // Verify recipe is visible
            await expect(page.getByText("Public Test Recipe")).toBeVisible()
            await expect(page.getByText("A public recipe for testing visibility")).toBeVisible()
        })

        test("cannot view private recipe and is redirected to login", async ({
            unauthenticatedPage: page,
            baseURL,
        }) => {
            // Try to access private recipe
            await page.goto(
                `${baseURL}/recipes/${createRecipeSlug("Private Test Recipe", privateRecipeId)}`
            )

            // Verify recipe not found message
            await expect(page.getByText("Recept niet gevonden")).toBeVisible()
        })
    })
})
