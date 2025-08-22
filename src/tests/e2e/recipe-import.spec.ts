import { test, expect } from "../fixtures"
import { v4 as uuidv4 } from "uuid"

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

    test("imports a recipe from a description", async ({ authenticatedPage: page }) => {
        const RECIPE_DESCRIPTION = `
        Pannenkoeken
        Een heerlijk gerecht voor 4 personen.
        Ingrediënten:
        - 100 gram bloem
        - 2 eieren
        - 100 gram suiker
        - 100 gram zout
        - 100 gram water
        Bereidingswijze:
        - Meng de ingrediënten
        - Bak de pannenkoeken
        - Serveer met jam
        `

        // Open the URL import dialog
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await page.getByRole("button", { name: "Notitie" }).click()

        // Fill in the description and submit
        await page.getByRole("textbox", { name: "Recepttekst" }).fill(RECIPE_DESCRIPTION)
        await page.getByRole("button", { name: "Importeren" }).click()

        // Go to the collection page and check for the pending recipe
        await page.getByRole("link", { name: "Collectie" }).click()
        await expect(page.getByText("Pannenkoeken")).toBeVisible()
    })

    test("imports a recipe from an image", async () => {
        // TODO: make this work with the camera permissions
        await expect(0).toBe(1)
    })
})

test.describe("Failed job", () => {
    test.afterEach(async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Collectie" }).click()
        const removeButtons = await page.getByRole("button", { name: "Verwijder import" }).all()
        for (const button of removeButtons) {
            await button.click()
        }
    })

    test("import from non-food url should show a failed job", async ({
        authenticatedPage: page,
    }) => {
        const testId = uuidv4()
        const RECIPE_URL = `https://paperdork.nl/online-boekhouden/?testId=${testId}`

        // Open the URL import dialog
        await page.getByRole("button", { name: "Importeer recept" }).click()
        await page.getByRole("button", { name: "Website" }).click()

        // Fill in the URL and submit
        await page.getByRole("textbox", { name: "URL" }).fill(RECIPE_URL)
        await page.getByRole("button", { name: "Importeren" }).click()

        // Go to the collection page and check for the failed job
        await page.getByRole("link", { name: "Collectie" }).click()

        const failedJob = await page.getByText("Import mislukt").first()
        await expect(failedJob).toBeVisible({ timeout: 15000 })

        await page.getByRole("button", { name: "Verwijder import" }).click()

        await expect(failedJob).not.toBeVisible()
    })
})
