import { test, expect } from "./fixtures"

test.describe("Recipe import flows", () => {
    test.beforeEach(async ({ authenticatedPage: page, baseURL }) => {
        // Navigate to the import page before each test
        await page.goto(`${baseURL}/import`)
    })

    test("imports a recipe and displays the source", async ({ authenticatedPage: page }) => {
        const RECIPE_URL = "https://www.recipetineats.com/parmesan-roasted-green-beans/"

        // Open the URL import dialog
        await page.getByRole("button", { name: "Site scannen" }).click()

        // Fill in the URL and submit
        await page.locator("input[name='url']").fill(RECIPE_URL)
        await page.getByRole("button", { name: "Toevoegen" }).click()

        // Wait for the import and save process to complete by waiting for navigation to the recipe page.
        // The URL will contain a UUID, so we use a regex.
        await page.waitForURL(/\/edit\/[a-f0-9-]+/)

        // Save the recipe
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Navigate the popup
        await page.getByRole("button", { name: "Opslaan" }).click()

        // Verify the source link is displayed correctly
        const sourceLink = page.getByTestId("recipe-source-link")
        await expect(sourceLink).toBeVisible()
        await expect(sourceLink).toHaveAttribute("href", RECIPE_URL)
    })
})
