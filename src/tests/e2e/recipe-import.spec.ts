import { test, expect } from "../fixtures"

test.describe("Recipe import flows", () => {
    test("imports a recipe from url", async ({ authenticatedPage: page }) => {
        const RECIPE_URL = "https://www.recipetineats.com/parmesan-roasted-green-beans/"
        const host = "recipetineats.com"

        // Open the URL import dialog
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await page.getByRole("button", { name: "Website" }).click()

        // Fill in the URL and submit
        await page.getByRole("textbox", { name: "URL" }).fill(RECIPE_URL)
        await page.getByRole("button", { name: "Importeren" }).click()

        // Go to the collection page and check for the pending recipe
        await page.getByRole("link", { name: "Collectie" }).click()
        await expect(page.getByText(host)).toBeVisible()
    })
})
