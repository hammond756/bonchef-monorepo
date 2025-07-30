import { test, expect } from "../fixtures"

test.describe("Favorites functionality", () => {
    test("saves recipe, goes to collection page and unsaves recipe", async ({
        authenticatedPage: page,
    }) => {
        // First like a recipe
        await page.goto("/ontdek")
        await page.getByRole("button", { name: "Voeg toe aan favorieten" }).first().click()

        // Go to collection page and switch to favorites tab
        await page.getByRole("link", { name: "Collectie" }).click()
        await page.getByText("Mijn favorieten").click()

        // Remove bookmarks from all recipes
        const buttons = await page.getByRole("button", { name: "Verwijder uit favorieten" })
        for (const button of await buttons.all()) {
            await button.click()
        }

        // Verify the recipe is no longer visible in favorites
        await expect(
            page.getByText("Ontdek nieuwe recepten en sla ze op als favoriet.")
        ).toBeVisible()
    })
})
