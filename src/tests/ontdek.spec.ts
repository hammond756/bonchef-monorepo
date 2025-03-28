import { expect, test } from "@playwright/test";

// Test suite for authenticated user interactions with the Ontdek page
test.describe("Ontdek page - Authenticated User", () => {

  test("User email is visible in navbar when logged in", async ({ page }) => {
    await page.goto("/ontdek")
    
    // Get the email used for testing
    const userEmail = process.env.TEST_USER_EMAIL!
    
    // Check that user email is visible in the navbar (primary assertion)
    await expect(page.getByText(userEmail)).toBeVisible();
  });
  
});

// Test suite for non-authenticated users
test.describe("Ontdek page - Anonymous User", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test("Anonymous user can view ontdek page but email is not in navbar", async ({ page, baseURL }) => {
    // Navigate to ontdek page directly
    await page.goto(baseURL! + "/ontdek");
    
    // Check we're on the correct page
    await expect(page).toHaveURL("/ontdek");
    
    // Verify page title is visible
    await expect(page.getByText("Ontdek recepten")).toBeVisible();

    await page.getByTestId("side-bar-hamburger-menu").click()
    
    // Email should not be visible since we're not authenticated
    await expect(page.getByText(/@/)).not.toBeVisible();
    
    // Login link should be visible instead
    await expect(page.getByText("Login")).toBeVisible();
  });
}); 