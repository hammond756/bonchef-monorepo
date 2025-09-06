import { test, expect } from "../fixtures"

test.describe("Comment Flow", () => {
    test("should open comment overlay when clicking comment button", async ({
        authenticatedPage: page,
    }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = page.getByRole("button", { name: "Bekijk reacties" }).first()

        await expect(commentButton).toBeEnabled()

        // Click comment button on first recipe
        await commentButton.click()

        // Check if overlay appears
        await expect(page.getByRole("heading", { name: "Reacties" })).toBeVisible()
        await expect(page.getByPlaceholder("Schrijf een reactie...")).toBeVisible()
    })

    test("should create and display new comment", async ({ authenticatedPage: page }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = page.getByRole("button", { name: "Bekijk reacties" }).first()

        await expect(commentButton).toBeEnabled()

        // Click comment button
        await commentButton.click()

        // Wait for overlay to appear
        await expect(page.getByRole("heading", { name: "Reacties" })).toBeVisible()

        // Type and submit comment
        const commentText = `Dit is een test reactie op ${new Date().toISOString()}`
        await page.getByRole("textbox", { name: "Schrijf een reactie" }).fill(commentText)
        await page.getByRole("button", { name: "Verstuur reactie" }).click()

        // Check if comment appears
        await expect(page.getByLabel(commentText)).toBeVisible()
    })

    test("should delete own comment", async ({ authenticatedPage: page }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = await page.getByRole("button", { name: "Bekijk reacties" }).first()
        await expect(commentButton).toBeEnabled()

        // Click comment button
        await commentButton.click()

        // Wait for overlay to appear
        await expect(page.getByRole("heading", { name: "Reacties" })).toBeVisible()

        // Create a comment first
        const commentText = `Comment om te verwijderen op ${new Date().toISOString()}`
        await page.getByRole("textbox", { name: "Schrijf een reactie" }).fill(commentText)
        await page.getByRole("button", { name: "Verstuur reactie" }).click()

        // Wait for comment to appear
        await expect(page.getByLabel(commentText)).toBeVisible()

        // Delete the comment
        const deleteButton = page.getByRole("button", { name: "Verwijder reactie" }).first()
        await deleteButton.click()

        // Check if comment is removed
        await expect(page.getByLabel(commentText)).not.toBeVisible()
    })

    test("should show character limit", async ({ authenticatedPage: page }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = await page.getByRole("button", { name: "Bekijk reacties" }).first()
        await expect(commentButton).toBeEnabled()

        // Click comment button
        await commentButton.click()

        // Wait for overlay to appear
        await expect(page.getByRole("heading", { name: "Reacties" })).toBeVisible()

        // Check initial character count
        await expect(page.getByLabel("500 karakters over")).toBeVisible()

        // Type some text
        await page.getByRole("textbox", { name: "Schrijf een reactie" }).fill("Test")

        // Check updated character count
        await expect(page.getByLabel("496 karakters over")).toBeVisible()
    })

    test("should close overlay with X button", async ({ authenticatedPage: page }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = await page.getByRole("button", { name: "Bekijk reacties" }).first()
        await expect(commentButton).toBeEnabled()

        // Click comment button
        await commentButton.click()

        // Wait for overlay to appear
        await expect(page.getByRole("heading", { name: "Reacties" })).toBeVisible()

        // Click X button
        await page.getByRole("button", { name: "Sluit reacties" }).click()

        // Check if overlay is closed
        await expect(page.getByRole("heading", { name: "Reacties" })).not.toBeVisible()
    })

    test("should close overlay by clicking outside", async ({ authenticatedPage: page }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = await page.getByRole("button", { name: "Bekijk reacties" }).first()
        await expect(commentButton).toBeEnabled()

        // Click comment button
        await commentButton.click()

        // Wait for overlay to appear
        await expect(page.getByRole("heading", { name: "Reacties" })).toBeVisible()

        // Click outside overlay (on background)
        await page.click('div[class*="bg-black"]')

        // Check if overlay is closed
        await expect(page.getByRole("heading", { name: "Reacties" })).not.toBeVisible()
    })

    test("should redirect to signup when opening comment overlay without being logged in", async ({
        unauthenticatedPage: page,
    }) => {
        await page.goto("/ontdek")

        // Wait for recipes to load
        const commentButton = await page.getByRole("button", { name: "Bekijk reacties" }).first()
        await expect(commentButton).toBeEnabled()

        // Click comment button
        await commentButton.click()

        // Check if overlay appears
        await page.waitForURL(/signup/)
    })
})
