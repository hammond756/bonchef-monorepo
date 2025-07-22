import { test, expect } from "./fixtures"

test.describe("Favorites functionality", () => {
    test("saves recipe, goes to collection page and unsaves recipe", async ({
        authenticatedPage: page,
    }) => {
        // First like a recipe
        await page.goto("/ontdek")
        const likeButton = page.locator("[data-testid='bookmark-recipe-button']").first()
        await likeButton.click()

        await page.waitForTimeout(1000)

        // Go to collection page and switch to favorites tab
        await page.goto("/collection")
        await page.getByText("Mijn favorieten").click()

        // Get the like button in favorites and unlike the recipe
        const favoritesLikeButton = page.locator("[data-testid='bookmark-recipe-button']").first()
        await favoritesLikeButton.click()

        // Verify the recipe is no longer visible in favorites
        await expect(page.getByText("Je hebt nog geen favoriete recepten")).toBeVisible()
    })
})
