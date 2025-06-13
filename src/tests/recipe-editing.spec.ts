import { Page } from "@playwright/test"
import { test, expect } from "./fixtures"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"
import { importRecipe, saveRecipe } from "./utils/recipe-helpers"

async function createRecipe(page: Page, baseURL: string) {
    const response = await page.request.post(`${baseURL}/api/save-recipe`, {
        data: {
            title: "Test Recipe",
            description: "A recipe for testing",
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
            thumbnail: TINY_PLACEHOLDER_IMAGE,
            total_cook_time_minutes: 10,
            source_url: "http://localhost:3000",
            source_name: "Test Recipe",
        },
    })

    const data = await response.json()
    return data.recipe.id
}

test.describe("Recipe editing flows", () => {
    let recipeId: string

    test.beforeAll(async ({ authenticatedPage: page, baseURL }) => {
        // Create a test recipe via API
        recipeId = await createRecipe(page, baseURL!)
    })

    test.beforeEach(async ({ authenticatedPage: page, baseURL }) => {
        // Navigate to edit page before each test
        await page.goto(`${baseURL}/edit/${recipeId}`)
    })

    test("edits recipe title and description", async ({ authenticatedPage: page }) => {
        // Edit basic details
        await page.fill("input[placeholder='Recept naam']", "Verbeterde Pasta Carbonara")
        await page.fill(
            "textarea[placeholder='Beschrijving']",
            "Een luxe versie van pasta carbonara met verse ingrediënten"
        )

        await page.click("button:text('Opslaan')")

        // Handle visibility modal
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify changes on detail page
        await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`))
        await expect(page.getByTestId("recipe-title")).toContainText("Verbeterde Pasta Carbonara")
        await expect(page.getByText("Een luxe versie van pasta carbonara")).toBeVisible()
    })

    test("updates portion size", async ({ authenticatedPage: page }) => {
        // Change portion size
        await page.fill("input[placeholder='Porties']", "4")
        await page.click("button:text('Opslaan')")

        // Handle visibility modal
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify on detail page
        await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`))
        await expect(page.getByText("4 porties")).toBeVisible()
    })

    test("manages ingredients - add, edit, remove", async ({ authenticatedPage: page }) => {
        // Add new ingredient
        await page.getByTestId("add-ingredient").click()

        // Get the last ingredient in the list
        const newIngredient = page.locator("[data-testid='ingredient-item']").last()
        await newIngredient.getByTestId("ingredient-quantity").fill("50")
        await newIngredient.locator("select").selectOption("milliliter")
        await newIngredient.getByTestId("ingredient-description").fill("witte wijn")

        // Edit existing ingredient
        const firstIngredient = page.locator("[data-testid='ingredient-item']").first()
        await firstIngredient.getByTestId("ingredient-quantity").fill("400")
        await firstIngredient.getByTestId("ingredient-description").fill("spaghetti")

        await page.getByTestId("save-recipe").click()

        // Handle visibility modal
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify changes
        await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`))
        await expect(page.getByText("50 milliliter witte wijn")).toBeVisible()
        await expect(page.getByText("400 gram spaghetti")).toBeVisible()
    })

    test("manages instructions - add, edit, remove", async ({ authenticatedPage: page }) => {
        // Add new instruction
        await page.getByTestId("add-instruction").click()
        const instructions = page.locator("textarea").filter({ hasText: /.*/ })
        await instructions.last().fill("Schenk een glas witte wijn in voor de kok")

        // Edit existing instruction
        await instructions.first().fill("Kook de pasta volgens de verpakking al dente")

        await page.getByTestId("save-recipe").click()

        // Handle visibility modal
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify changes
        await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`))
        await expect(page.getByText("Kook de pasta volgens de verpakking al dente")).toBeVisible()
        await expect(page.getByText("Schenk een glas witte wijn in voor de kok")).toBeVisible()
    })

    test("handles image upload", async ({ authenticatedPage: page }) => {
        // Upload image file
        await page.setInputFiles("input[type='file']", "playwright/test-fixtures/recipe-image.png")

        await page.getByTestId("save-recipe").click()

        // Handle visibility modal
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify image is displayed
        await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`))
        await expect(page.getByTestId("recipe-image")).toBeVisible()
    })

    test("generates new recipe image", async ({ authenticatedPage: page }) => {
        // Click generate image button
        await page.getByTestId("generate-image-button").click()

        // Wait for modal to appear
        await expect(page.getByText("Afbeelding instellingen")).toBeVisible()

        // Select camera angle and kitchen style
        await page.getByText("Top-down perspectief").click()
        await page.getByText("Minimalistisch wit").click()

        // Click generate button
        await page.getByRole("button", { name: "Genereer" }).click()

        // Wait for generation to complete with 2 minute timeout
        await expect(page.getByText("Afbeelding genereren...")).not.toBeVisible({ timeout: 120000 }) // 2 minutes in milliseconds

        await expect(page.getByTestId("recipe-image-preview")).toBeVisible({ timeout: 120000 })

        await page.getByTestId("save-recipe").click()

        // Handle visibility modal
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify image persists after save
        await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`))
        await expect(page.getByTestId("recipe-image")).toBeVisible()
    })

    test("toggles recipe visibility", async ({ authenticatedPage: page }) => {
        // Create a new recipe for this test
        await page.goto(`/edit/${recipeId}`)

        // Save with private visibility first
        await page.getByTestId("save-recipe").click()
        await page.getByText("Privé").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify private badge is visible
        await expect(page.getByText("Privé")).toBeVisible()

        // Edit the recipe again
        await page.click("text=Bewerk recept")

        // Save with public visibility
        await page.getByTestId("save-recipe").click()
        await page.getByText("Openbaar").click()
        await page.getByRole("button", { name: "Opslaan" }).click()

        await page.waitForURL(new RegExp(`/recipes/${recipeId}`))

        // Verify public badge is visible
        await expect(page.getByText("Openbaar")).toBeVisible()
    })
})

test("deletes recipe", async ({ authenticatedPage: page, baseURL }) => {
    const recipeForDeletion = await createRecipe(page, baseURL!)
    await page.goto(`${baseURL}/edit/${recipeForDeletion}`)
    // Click delete button
    await page.getByTestId("delete-recipe").click()

    // Verify redirect to homepage
    await expect(page).toHaveURL(baseURL!)

    // Verify recipe no longer exists
    await page.goto(`${baseURL}/recipes/${recipeForDeletion}`)
    await expect(page.getByText("Recept niet gevonden")).toBeVisible()
    await expect(page.getByText("Terug naar homepage")).toBeVisible()
})

test.describe("Recipe import and edit flows", () => {
    test.beforeEach(async ({ authenticatedPage: page, baseURL }) => {
        // Navigate to import page before each test
        await page.goto(`${baseURL}/import`)
    })

    test("imports a recipe from a URL, edits, and saves it", async ({
        authenticatedPage: page,
    }) => {
        const recipeId = await importRecipe({
            page,
            importMethod: "url",
            importContent:
                "https://www.hellofresh.nl/recipes/kleine-half-om-half-hamburgers-met-tapenade-roomsaus-63a2d0fc858485949306b4d5",
        })

        // Edit the title
        const newTitle = "Mijn Geweldige Enchiladas"
        await page.locator("input[placeholder='Recept naam']").fill(newTitle)

        // Save the recipe
        await saveRecipe({ page, recipeId, visibility: "Privé" })

        // Verify the title was updated
        await expect(page.getByTestId("recipe-title")).toContainText(newTitle)
    })

    test("imports a recipe, edits, and cancels, deleting the draft", async ({
        authenticatedPage: page,
        baseURL,
    }) => {
        const recipeId = await importRecipe({
            page,
            importMethod: "url",
            importContent:
                "https://www.hellofresh.nl/recipes/kleine-half-om-half-hamburgers-met-tapenade-roomsaus-63a2d0fc858485949306b4d5",
        })

        // Edit the title to make the form "dirty"
        await page.locator("input[placeholder='Recept naam']").fill("This should be deleted")

        // Click the cancel button
        await page.getByTestId("cancel-recipe").click()

        // Verify the confirmation dialog appears and accept it
        await expect(page.getByText("Weet je het zeker?")).toBeVisible()
        await page.getByRole("button", { name: "Annuleer en verlies wijzigingen" }).click()

        // Verify we are navigated back to the import page
        await expect(page).toHaveURL(`${baseURL}/import`)

        // Verify the draft recipe was deleted by trying to navigate to its edit page
        await page.goto(`${baseURL}/edit/${recipeId}`)
        await expect(
            page.getByText("Er is iets misgegaan bij het laden van het recept.")
        ).toBeVisible()
    })

    test("triggers unsaved changes warning on browser navigation", async ({
        authenticatedPage: page,
    }) => {
        await importRecipe({
            page,
            importMethod: "text",
            importContent: "havermout pap",
        })

        const editPageUrl = page.url()

        // Edit the title to make the form "dirty"
        await page.locator("input[placeholder='Recept naam']").fill("Unsaved Changes Test")

        let dialogAppeared = false
        // Set up a listener to automatically dismiss the 'beforeunload' dialog
        page.once("dialog", (dialog) => {
            dialog.dismiss()
            dialogAppeared = true
        })

        // Attempt to close the tab by navigating to about:blank
        await page.evaluate(() => (window.location.href = "about:blank"))

        // Wait for the dialog to appear
        await page.waitForTimeout(500)

        expect(dialogAppeared).toBe(true)

        // Verify that the URL has NOT changed, confirming navigation was blocked
        expect(page.url()).toBe(editPageUrl)
    })
})
