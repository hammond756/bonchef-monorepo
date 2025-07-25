import { test, expect } from "../fixtures"

test.describe("Onboarding triggers", () => {
    test("should show onboarding to anonymous user once on the collection page", async ({
        unauthenticatedPage: page,
    }) => {
        await page.goto("/collection")
        await page.waitForTimeout(2 * 1000)
        await expect(page.getByText("Onboarding")).toBeVisible()

        await page.goto("/")
        await expect(page.getByText("Onboarding")).not.toBeVisible()

        await page.goto("/collection")
        await expect(page.getByText("Onboarding")).not.toBeVisible()
    })

    test("should show onboarding to anonymous when they click the import button", async ({
        unauthenticatedPage: page,
    }) => {
        await page.goto("/")
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await expect(page.getByText("Onboarding")).toBeVisible()
    })

    test.describe("onboarding when navigating back from recipe page", () => {
        let recipeId: string

        test.beforeEach(async ({ authenticatedPage, baseURL }) => {
            // Create a public test recipe before the test runs
            const publicResponse = await authenticatedPage.request.post(
                `${baseURL}/api/save-recipe`,
                {
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
                }
            )

            const {
                recipe: { id },
            } = await publicResponse.json()
            recipeId = id
        })

        test("should show onboarding to anonymous users when they navigate back from the recipe page", async ({
            unauthenticatedPage: page,
        }) => {
            await page.goto(`/recipes/${recipeId}`)
            await page.getByRole("button", { name: "Ga terug" }).click()

            await expect(page.getByText("Onboarding")).toBeVisible()
        })
    })

    test("should never show onboarding to authenticated user", async ({
        authenticatedPage: page,
    }) => {
        await page.goto("/")
        await expect(page.getByText("Onboarding")).not.toBeVisible()

        await page.getByRole("button", { name: "Importeer recept" }).click()
        await expect(page.getByText("Onboarding")).not.toBeVisible()

        await page.getByRole("button", { name: "Sluiten" }).click()

        await page.goto("/collection")
        await expect(page.getByText("Onboarding")).not.toBeVisible()
    })
})

test.describe("Onboarding flow", () => {
    test("user cancels onboarding via the close button", async ({ unauthenticatedPage: page }) => {
        await page.goto("/")
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await expect(page.getByText("Onboarding")).toBeVisible()
        await expect(page.getByText("Welkom bij Bonchef!")).toBeVisible()

        await page.getByRole("button", { name: "Sluiten" }).click()
        await expect(page.getByText("Onboarding")).not.toBeVisible()
    })

    test("user cancels onboarding via the skip text", async ({ unauthenticatedPage: page }) => {
        await page.goto("/")
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await expect(page.getByText("Onboarding")).toBeVisible()

        await page.getByText("Later misschien").click()
        await expect(page.getByText("Onboarding")).not.toBeVisible()
    })

    test("user completes onboarding and signs up", async ({ unauthenticatedPage: page }) => {
        await page.goto("/")
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await expect(page.getByText("Onboarding")).toBeVisible()
        await expect(page.getByText("Welkom bij Bonchef!")).toBeVisible()

        await page.getByRole("button", { name: "Volgende" }).click()
        await expect(page.getByText("Ontdek Bonchef")).toBeVisible()

        await page.getByRole("button", { name: "Volgende" }).click()
        await expect(page.getByText("Voeg je eerste recept toe")).toBeVisible()

        await page.getByText("Schrijf je eigen recept op").click()
        await page.getByRole("textbox", { name: "Recepttekst" }).fill("Pizza Margherita")
        await page.getByRole("button", { name: "Importeren" }).click()

        await expect(page.getByText("Maak nu een account aan")).toBeVisible()
        await page.getByRole("button", { name: "Aanmelden" }).click()

        // check that we're on the signup page (by checking the url)
        await page.waitForURL(/\/signup/)

        await expect(page.getByRole("button", { name: "Account aanmaken" })).toBeVisible()

        // Create an account
        await page.getByRole("textbox", { name: "Email" }).fill(`test-${Date.now()}@test.com`)
        await page.getByRole("textbox", { name: "Gebruikersnaam" }).fill("testuser")
        await page.getByRole("textbox", { name: "Wachtwoord", exact: true }).fill("test123")
        await page
            .getByRole("textbox", { name: "Bevestig wachtwoord", exact: true })
            .fill("test123")

        await page.getByRole("button", { name: "Account aanmaken" }).click()

        // Wait until redirected to the discover page
        await page.waitForURL(/\/ontdek/)

        // Go to the collection page
        await page.goto("/collection")

        await expect(page.getByText("Pizza Margherita")).toBeVisible()
    })
})
