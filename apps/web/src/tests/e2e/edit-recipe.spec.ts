import { test, expect } from "../fixtures"
import { Page } from "@playwright/test"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"

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

async function dragByMouse(
    page: Page,
    from: import("@playwright/test").Locator,
    to: import("@playwright/test").Locator,
    yOffset = 20
) {
    await from.scrollIntoViewIfNeeded()
    await to.scrollIntoViewIfNeeded()
    const fromBox = await from.boundingBox()
    const toBox = await to.boundingBox()
    if (!fromBox || !toBox) throw new Error("Unable to obtain bounding boxes for drag operation")

    const fromX = fromBox.x + fromBox.width / 2
    const fromY = fromBox.y + fromBox.height / 2
    const toX = toBox.x + toBox.width / 2
    const toY = toBox.y + toBox.height / 2 + yOffset

    await page.mouse.move(fromX, fromY)
    await page.mouse.down()
    // Move enough distance to satisfy activationConstraint: { distance: 8 }
    await page.mouse.move(fromX, fromY + 12)
    await page.mouse.move(toX, toY, { steps: 15 })
    await page.waitForTimeout(50)
    await page.mouse.up()
}

test.describe("Recipe Edit Page", () => {
    let recipeId: string

    test.beforeAll(async ({ authenticatedPage: page, baseURL }) => {
        // Create a test recipe via API
        recipeId = await createRecipe(page, baseURL!)
    })

    test.beforeEach(async ({ authenticatedPage: page, baseURL }) => {
        // Navigate to edit page before each test
        await page.goto(`${baseURL}/edit/${recipeId}`)
    })

    test.describe("Page Layout & Navigation", () => {
        test("should display sticky header with back arrow, title, and save button", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 1: Sticky Header

            // Verify sticky header is visible
            const header = page.locator("header")
            await expect(header).toBeVisible()
            await expect(header).toHaveCSS("position", "sticky")

            // Verify back button is present and has correct aria-label
            const backButton = page.getByRole("button", { name: "Terug naar recept" })
            await expect(backButton).toBeVisible()

            // Verify title is present
            const title = page.getByRole("heading", { name: "Bewerken" })
            await expect(title).toBeVisible()

            // Verify save button is present
            const saveButton = page.getByRole("button", { name: "Opslaan" })
            await expect(saveButton).toBeVisible()
        })

        test("should disable save button during uploads/generations", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 2: Save Button State
            // Page is already loaded via beforeEach

            // Wait for page to load and locate the save button
            const saveButton = page.getByRole("button", { name: "Opslaan" })
            await expect(saveButton).toBeVisible()

            // Verify save button is initially enabled (assuming valid recipe)
            await expect(saveButton).toBeEnabled()

            await page.getByRole("button", { name: "Foto wijzigen" }).click()

            // Test image generation disables save button
            const generateImageButton = page.getByRole("button", { name: /AI Genereren/i })
            await generateImageButton.click()

            // Verify save button is disabled during generation
            await expect(saveButton).toBeDisabled()

            // Wait for generation to complete and save button to be re-enabled
            await expect(saveButton).toBeEnabled({ timeout: 30000 })
        })

        test("should show confirmation dialog when using application back button with unsaved changes", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 3a: Navigation Warning - Application Back Button

            // Make changes to make the form dirty
            const titleInput = page.getByLabel("Recept titel")
            await titleInput.fill("Unsaved Changes Test")

            // Click the application back button
            const backButton = page.getByRole("button", { name: "Terug naar recept" })
            await backButton.click()

            // Verify confirmation dialog appears
            await expect(
                page.getByText(
                    "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?"
                )
            ).toBeVisible()

            // Test canceling navigation
            await page.getByRole("button", { name: "Blijven" }).click()

            // Verify we stay on edit page
            await expect(page).toHaveURL(new RegExp(`/edit/${recipeId}`))

            // Click back button again
            await backButton.click()

            // Confirm leaving this time
            await page.getByRole("button", { name: "Vertrekken" }).click()

            // Verify we navigated away (should go back to previous page)
            await expect(page).not.toHaveURL(new RegExp(`/edit/${recipeId}`))
        })

        test("should show confirmation dialog when using browser back button with unsaved changes", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 3b: Navigation Warning - Browser Back Button

            const editPageUrl = page.url()

            // Make changes to make the form dirty
            const titleInput = page.getByLabel("Recept titel")
            await titleInput.fill("Unsaved Changes Test")

            let dialogAppeared = false
            // Set up a listener to automatically dismiss the 'beforeunload' dialog
            page.once("dialog", (dialog) => {
                dialog.dismiss()
                dialogAppeared = true
            })

            // Attempt browser navigation that would trigger beforeunload
            await page.evaluate(() => (window.location.href = "about:blank"))

            // Wait for the dialog to appear
            await page.waitForTimeout(500)

            // Verify dialog appeared
            expect(dialogAppeared).toBe(true)

            // Verify that the URL has NOT changed, confirming navigation was blocked
            expect(page.url()).toBe(editPageUrl)
        })

        test("should save changes and navigate to recipe page", async ({
            authenticatedPage: page,
        }) => {
            // Positive navigation flow - successful save
            const saveButton = page.getByRole("button", { name: "Opslaan" })

            // Make a change to the recipe
            const titleInput = page.getByLabel("Recept titel")
            await titleInput.fill("Updated Recipe Title")

            // Click save button
            await saveButton.click()

            // Handle visibility modal - select private
            await page.getByText("Privé").click()
            await page.getByRole("button", { name: "Bevestig zichtbaarheid" }).click()

            await page.waitForURL(new RegExp(`/recipes`))

            // Verify the updated title is displayed
            await expect(page.getByLabel("Recept titel")).toContainText("Updated Recipe Title")
        })
    })

    test.describe("Recipe Information Section", () => {
        test("should allow changing the recipe image", async ({ authenticatedPage: page }) => {
            // Requirement 5: Recipe Image

            const imageInput = page.getByRole("button", { name: "Foto wijzigen" })
            await imageInput.click()

            const uploadPromise = page.waitForEvent("filechooser")
            await page.getByRole("button", { name: "Galerij" }).click()

            // At this point, a system image picker should be openend. Select the test image.
            const fileChooser = await uploadPromise
            await fileChooser.setFiles("playwright/test-fixtures/recipe-image.png")

            await page.getByRole("button", { name: "Opslaan" }).click()

            // Handle visibility modal - select private
            await page.getByText("Privé").click()
            await page.getByRole("button", { name: "Bevestig zichtbaarheid" }).click()

            await page.waitForURL(new RegExp(`/recipes`))

            // Verify the updated image is displayed
            await expect(page.getByLabel("Recept afbeelding")).toHaveAttribute(
                "src",
                new RegExp(`/storage/`)
            )
        })

        test("should allow inline editing of recipe title", async ({ authenticatedPage: page }) => {
            // Requirement 6: Recipe Title

            const titleInput = page.getByLabel("Recept titel")

            // Verify title input is visible and editable
            await expect(titleInput).toBeVisible()
            await expect(titleInput).toBeEditable()

            // Test editing the title
            await titleInput.clear()
            await titleInput.fill("New Recipe Title")

            // Verify the value was updated
            await expect(titleInput).toHaveValue("New Recipe Title")

            // Test that the change makes the form dirty (save button should be enabled)
            const saveButton = page.getByRole("button", { name: "Opslaan" })
            await expect(saveButton).toBeEnabled()
        })

        test("should support multiline description with auto-resize", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 9: Description

            const descriptionTextarea = page.getByLabel("Recept beschrijving")

            // Verify description textarea is visible and editable
            await expect(descriptionTextarea).toBeVisible()
            await expect(descriptionTextarea).toBeEditable()

            // Test multiline input
            const multilineText = "This is line 1\nThis is line 2\nThis is line 3"
            await descriptionTextarea.clear()
            await descriptionTextarea.fill(multilineText)

            // Verify the multiline value was set
            await expect(descriptionTextarea).toHaveValue(multilineText)

            // Verify the textarea has expanded to 3 lines (height for 3 rows)
            const textareaHandle = await descriptionTextarea.elementHandle()
            const height = await textareaHandle?.evaluate((el: HTMLElement) => el.offsetHeight)
            // Typical line height is ~20-24px, so 3 lines should be at least 60px
            expect(height).toBeGreaterThan(50)
        })
    })

    test.describe("Ingredient Groups & Ingredients", () => {
        test("should support inline editing of group titles", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 11: Group Management

            // Find the ingredient group title input
            const groupTitleInput = page.getByLabel("Naam van receptgroep").first()

            // Verify group title is editable
            await expect(groupTitleInput).toBeVisible()
            await expect(groupTitleInput).toBeEditable()

            // Edit the group title
            await groupTitleInput.clear()
            await groupTitleInput.fill("Hoofdingrediënten")

            // Verify the value was updated
            await expect(groupTitleInput).toHaveValue("Hoofdingrediënten")
        })

        test("should reorder groups using the drag handle", async ({ authenticatedPage: page }) => {
            // Ensure we have at least two groups
            await page.getByRole("button", { name: "Groep toevoegen" }).click()

            // Name groups for stable selectors
            const firstGroupTitle = page.getByLabel("Naam van receptgroep").nth(0)
            const secondGroupTitle = page.getByLabel("Naam van receptgroep").nth(1)
            await firstGroupTitle.fill("Eerste groep")
            await secondGroupTitle.fill("Tweede groep")

            // Drag first group below the second using the drag handle ("Sleep hendel")
            const firstGroupHandle = page.getByLabel("Sleep hendel voor receptgroep Eerste groep")
            const secondGroupHandle = page.getByLabel("Sleep hendel voor receptgroep Tweede groep")

            await dragByMouse(page, firstGroupHandle, secondGroupHandle, 40)

            // Verify order swapped: first visible title should now be "Tweede groep"
            await expect(page.getByLabel("Naam van receptgroep").first()).toHaveValue(
                "Tweede groep"
            )
        })

        test("should reorder ingredients within a group using the drag handle", async ({
            authenticatedPage: page,
        }) => {
            // Add a second ingredient to the first group
            await page.getByRole("button", { name: "Ingrediënt toevoegen" }).first().click()

            // Set explicit names for both ingredients for stable selectors
            const ingredientNameInputs = page.locator('input[placeholder="Ingrediënt"]')
            await ingredientNameInputs.nth(0).fill("eerste")
            await ingredientNameInputs.nth(1).fill("tweede")

            // Drag the first ingredient below the second
            const firstIngredientHandle = page.getByLabel("Sleep hendel voor ingrediënt eerste")
            const secondIngredientHandle = page.getByLabel("Sleep hendel voor ingrediënt tweede")

            await dragByMouse(page, firstIngredientHandle, secondIngredientHandle, 30)

            // Verify order swapped: first ingredient name should now be "tweede"
            await expect(page.locator('input[placeholder="Ingrediënt"]').first()).toHaveValue(
                "tweede"
            )
        })

        test("should show a warning dialog when deleting a non-empty group", async ({
            authenticatedPage: page,
        }) => {
            // The default first group created by seed has at least one ingredient
            await page.getByRole("button", { name: "Verwijder receptgroep" }).first().click()

            await expect(page.getByText("Groep verwijderen")).toBeVisible()
            await page.getByRole("button", { name: "Annuleren" }).click()
            await expect(page.getByText("Groep verwijderen")).not.toBeVisible()
        })
    })

    test.describe("Header Actions", () => {
        test("should show a warning dialog when clicking delete recipe button", async ({
            authenticatedPage: page,
        }) => {
            await page.getByRole("button", { name: "Recept verwijderen" }).click()
            await expect(page.getByText("Recept verwijderen")).toBeVisible()
            await page.getByRole("button", { name: "Annuleren" }).click()
            await expect(page.getByText("Recept verwijderen")).not.toBeVisible()
        })
    })

    test.describe("Preparation Steps", () => {
        test("should focus the new input when adding ingredient or step", async ({
            authenticatedPage: page,
        }) => {
            // Add ingredient and expect focus on the new ingredient name input
            await page.getByRole("button", { name: "Ingrediënt toevoegen" }).first().click()
            const lastIngredientInput = page.locator('input[placeholder="Ingrediënt"]').last()
            await expect(lastIngredientInput).toBeFocused()

            // Add a preparation step and expect focus on the new textarea
            await page.getByRole("button", { name: "Stap toevoegen" }).first().click()
            const lastStepTextarea = page
                .locator('textarea[placeholder="Beschrijf deze stap..."]')
                .last()
            await expect(lastStepTextarea).toBeFocused()
        })
    })

    test.describe("Validation & Error Handling", () => {
        test("should disable save button when there are validation errors", async ({
            authenticatedPage: page,
        }) => {
            // Requirement 27: Error Prevention - Save Button Disabled
            const saveButton = page.getByRole("button", { name: "Opslaan" })

            // Initially the save button should be enabled (valid recipe)
            await expect(saveButton).toBeEnabled()

            // Create validation error by clearing the required title field
            const titleInput = page.getByLabel("Recept titel")
            await titleInput.clear()

            // Verify save button becomes disabled due to validation error
            await expect(saveButton).toBeDisabled()

            // Add a title that's too short (less than 3 characters)
            await titleInput.fill("ab")

            // Save button should still be disabled
            await expect(saveButton).toBeDisabled()

            // Add a valid title
            await titleInput.fill("Valid Recipe Title")

            // Save button should be re-enabled
            await expect(saveButton).toBeEnabled()
        })
    })
})
