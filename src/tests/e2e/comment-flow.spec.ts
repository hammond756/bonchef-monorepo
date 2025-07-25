import { test, expect } from "../fixtures"

test.describe("Comment Flow", () => {
    test("should open comment overlay when clicking comment button", async ({
        unauthenticatedPage,
    }) => {
        await unauthenticatedPage.goto("/ontdek")

        // Wait for recipes to load
        await unauthenticatedPage.waitForSelector('[data-testid="recipe-card"]')

        // Click comment button on first recipe
        const commentButton = unauthenticatedPage
            .locator('[data-testid="comment-recipe-button"]')
            .first()
        await commentButton.click()

        // Check if overlay appears
        await expect(unauthenticatedPage.locator("text=Reacties")).toBeVisible()
        await expect(unauthenticatedPage.locator("text=Schrijf een reactie...")).toBeVisible()
    })

    test("should create and display new comment", async ({ authenticatedPage }) => {
        await authenticatedPage.goto("/ontdek")

        // Wait for recipes to load
        await authenticatedPage.waitForSelector('[data-testid="recipe-card"]')

        // Click comment button
        const commentButton = authenticatedPage
            .locator('[data-testid="comment-recipe-button"]')
            .first()
        await commentButton.click()

        // Wait for overlay to appear
        await authenticatedPage.waitForSelector("text=Reacties")

        // Type and submit comment
        const commentText = "Dit is een test reactie!"
        await authenticatedPage.fill('textarea[placeholder="Schrijf een reactie..."]', commentText)
        await authenticatedPage.click('button[aria-label="Verstuur reactie"]')

        // Check if comment appears
        await expect(authenticatedPage.locator(`text=${commentText}`)).toBeVisible()
    })

    test("should delete own comment", async ({ authenticatedPage }) => {
        await authenticatedPage.goto("/ontdek")

        // Wait for recipes to load
        await authenticatedPage.waitForSelector('[data-testid="recipe-card"]')

        // Click comment button
        const commentButton = authenticatedPage
            .locator('[data-testid="comment-recipe-button"]')
            .first()
        await commentButton.click()

        // Wait for overlay to appear
        await authenticatedPage.waitForSelector("text=Reacties")

        // Create a comment first
        const commentText = "Comment om te verwijderen"
        await authenticatedPage.fill('textarea[placeholder="Schrijf een reactie..."]', commentText)
        await authenticatedPage.click('button[aria-label="Verstuur reactie"]')

        // Wait for comment to appear
        await expect(authenticatedPage.locator(`text=${commentText}`)).toBeVisible()

        // Delete the comment
        const deleteButton = authenticatedPage.locator('button[aria-label*="verwijder"]').first()
        await deleteButton.click()

        // Check if comment is removed
        await expect(authenticatedPage.locator(`text=${commentText}`)).not.toBeVisible()
    })

    test("should show character limit", async ({ authenticatedPage }) => {
        await authenticatedPage.goto("/ontdek")

        // Wait for recipes to load
        await authenticatedPage.waitForSelector('[data-testid="recipe-card"]')

        // Click comment button
        const commentButton = authenticatedPage
            .locator('[data-testid="comment-recipe-button"]')
            .first()
        await commentButton.click()

        // Wait for overlay to appear
        await authenticatedPage.waitForSelector("text=Reacties")

        // Check initial character count
        await expect(authenticatedPage.locator("text=500 karakters over")).toBeVisible()

        // Type some text
        await authenticatedPage.fill('textarea[placeholder="Schrijf een reactie..."]', "Test")

        // Check updated character count
        await expect(authenticatedPage.locator("text=496 karakters over")).toBeVisible()
    })

    test("should close overlay with X button", async ({ unauthenticatedPage }) => {
        await unauthenticatedPage.goto("/ontdek")

        // Wait for recipes to load
        await unauthenticatedPage.waitForSelector('[data-testid="recipe-card"]')

        // Click comment button
        const commentButton = unauthenticatedPage
            .locator('[data-testid="comment-recipe-button"]')
            .first()
        await commentButton.click()

        // Wait for overlay to appear
        await unauthenticatedPage.waitForSelector("text=Reacties")

        // Click X button
        await unauthenticatedPage.click('button[aria-label="Sluit reacties"]')

        // Check if overlay is closed
        await expect(unauthenticatedPage.locator("text=Reacties")).not.toBeVisible()
    })

    test("should close overlay by clicking outside", async ({ unauthenticatedPage }) => {
        await unauthenticatedPage.goto("/ontdek")

        // Wait for recipes to load
        await unauthenticatedPage.waitForSelector('[data-testid="recipe-card"]')

        // Click comment button
        const commentButton = unauthenticatedPage
            .locator('[data-testid="comment-recipe-button"]')
            .first()
        await commentButton.click()

        // Wait for overlay to appear
        await unauthenticatedPage.waitForSelector("text=Reacties")

        // Click outside overlay (on background)
        await unauthenticatedPage.click('div[class*="bg-black"]')

        // Check if overlay is closed
        await expect(unauthenticatedPage.locator("text=Reacties")).not.toBeVisible()
    })
})
