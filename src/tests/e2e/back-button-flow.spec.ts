import { test, expect } from "../fixtures"
import type { Page } from "@playwright/test"

async function getFirstRecipeId(page: Page): Promise<string> {
    await page.waitForSelector('a[href^="/recipes/"]')
    const firstRecipeLink = await page.locator('a[href^="/recipes/"]').first()
    const href = await firstRecipeLink.getAttribute("href")
    if (!href) {
        throw new Error("Could not find a recipe link on the page.")
    }
    return href.split("/").pop()!
}

test.describe("Back button navigation flow", () => {
    test("navigates to /ontdek after editing", async ({ authenticatedPage: page, baseURL }) => {
        // 1. Go to any recipe and then to the edit page
        const recipeId = await getFirstRecipeId(page)
        await page.goto(`${baseURL}/edit/${recipeId}`)
        await expect(page).toHaveURL(`${baseURL}/edit/${recipeId}`)

        // 2. Save the recipe
        await page.getByTestId("save-recipe").click()
        if (await page.getByText("Zichtbaarheid instellen").isVisible()) {
            await page.getByText("Privé").click()
            await page.getByRole("button", { name: "Opslaan" }).click()
        }

        // 3. Verify the URL is now /recipes/[id]?from=edit
        await expect(page).toHaveURL(new RegExp(`/recipes/*~${recipeId}\\?from=edit`))

        // 4. Click the back button
        await page.getByLabel("Ga terug").click()

        // 5. Verify the URL is now /ontdek
        await expect(page).toHaveURL(`${baseURL}/ontdek`)
    })

    test("back button is not visible when a modal is open", async ({
        authenticatedPage: page,
        baseURL,
    }) => {
        // 1. Navigate to a page with a modal trigger (edit page)
        const recipeId = await getFirstRecipeId(page)
        await page.goto(`${baseURL}/edit/${recipeId}`)

        // 2. The back button should be visible initially
        const backButton = page.getByLabel("Ga terug")
        await expect(backButton).toBeVisible()

        // 3. Open a modal
        await page.getByTestId("generate-image-button").click()
        await expect(page.getByText("Afbeelding instellingen")).toBeVisible()

        // 4. Verify the back button is NOT visible anymore
        await expect(backButton).not.toBeVisible()

        // 5. Close the modal and verify the back button is visible again
        await page.getByRole("button", { name: "Close" }).click()
        await expect(backButton).toBeVisible()
    })
})
