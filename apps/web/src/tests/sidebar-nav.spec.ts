import { expect, test } from "./fixtures"

test.describe("Sidebar Navigation", () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
        await page.goto("/")
    })

    test("sidebar is closed by default", async ({ authenticatedPage: page }) => {
        // Check that sidebar is not visible initially
        await expect(page.locator("[data-sidebar]")).toHaveClass(/\-translate-x-full/)
    })

    test("opens and closes with hamburger menu", async ({ authenticatedPage: page }) => {
        // Open sidebar
        await page.getByTestId("side-bar-hamburger-menu").click()
        await expect(page.locator("[data-sidebar]")).toHaveClass(/translate-x-0/)

        // Close sidebar with X button
        await page.locator("[data-sidebar] button[aria-label='Close menu']").click()
        await expect(page.locator("[data-sidebar]")).toHaveClass(/\-translate-x-full/)
    })

    test("closes when clicking outside", async ({ authenticatedPage: page }) => {
        // Open sidebar
        await page.getByTestId("side-bar-hamburger-menu").click()
        await expect(page.locator("[data-sidebar]")).toHaveClass(/translate-x-0/)

        // Click outside the sidebar (in the overlay)
        await page.locator(".bg-black\\/50").click()
        await expect(page.locator("[data-sidebar]")).toHaveClass(/\-translate-x-full/)
    })

    test("navigation to all pages works correctly", async ({ authenticatedPage: page }) => {
        // Open sidebar
        await page.getByTestId("side-bar-hamburger-menu").click()

        // Test navigation to Ontdek
        await page.locator("[data-sidebar]").getByText("Ontdek").click()
        await expect(page).toHaveURL("/ontdek")
        await expect(page.locator("[data-sidebar]")).toHaveClass(/\-translate-x-full/)

        // Reopen sidebar for next navigation
        await page.getByTestId("side-bar-hamburger-menu").click()

        // Test navigation to Collectie
        await page.locator("[data-sidebar]").getByText("Collectie").click()
        await expect(page).toHaveURL("/collection")
        await expect(page.locator("[data-sidebar]")).toHaveClass(/\-translate-x-full/)

        // Reopen sidebar for next navigation
        await page.getByTestId("side-bar-hamburger-menu").click()

        // Test navigation to Chat
        await page.locator("[data-sidebar]").getByText("Chat").click()
        await expect(page).toHaveURL("/chat")
        await expect(page.locator("[data-sidebar]")).toHaveClass(/\-translate-x-full/)
    })

    test("user info and logout is displayed correctly", async ({ authenticatedPage: page }) => {
        // Open sidebar
        await page.getByTestId("side-bar-hamburger-menu").click()

        // Check if user email is displayed
        await expect(page.locator("[data-sidebar]")).toContainText(process.env.TEST_USER_EMAIL!)

        // Check if logout button is present
        await expect(page.getByTestId("logout-button")).toBeVisible()
    })
})
