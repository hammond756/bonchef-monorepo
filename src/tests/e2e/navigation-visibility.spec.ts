import { test, expect } from "@playwright/test"

test.describe("Navigation Bar Visibility on Scroll", () => {
    test("should hide nav bars on scroll down and show on scroll up", async ({ page }) => {
        // Navigate to a page that uses TabLayout, e.g., the Discover page
        await page.goto("/ontdek")

        // Ensure the bars are initially visible
        const topBar = page.locator("header")
        const tabBar = page.locator("footer")
        await expect(topBar).toBeInViewport()
        await expect(tabBar).toBeInViewport()

        // Simulate scrolling down
        await page.mouse.wheel(0, 800)

        // Wait for the animation to complete
        await page.waitForTimeout(500)

        // Check that the bars are now out of the viewport
        await expect(topBar).not.toBeInViewport()
        await expect(tabBar).not.toBeInViewport()

        // Simulate scrolling up
        await page.mouse.wheel(0, -800)

        // Wait for the animation to complete
        await page.waitForTimeout(500)

        // Check that the bars are visible again
        await expect(topBar).toBeInViewport()
        await expect(tabBar).toBeInViewport()
    })
})
