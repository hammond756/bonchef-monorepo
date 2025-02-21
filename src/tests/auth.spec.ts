import { expect, test } from "@playwright/test";

test.describe("Authentication flows", () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    test("redirects to login when not authenticated", async ({ page, baseURL }) => {
        await page.goto(baseURL!);
        await expect(page).toHaveURL("/login");
    });
    
    test("logs in successfully and redirects to homepage", async ({ page, baseURL }) => {
        await page.goto(baseURL! + "/login");
        
        await page.fill("input[type='email']", process.env.TEST_USER_EMAIL!);
        await page.fill("input[type='password']", process.env.TEST_USER_PASSWORD!);
        await page.click("button[type='submit']");
        
        await expect(page).toHaveURL("/");
        await expect(page.getByText("Voeg recept toe")).toBeVisible();
    });
    
});

test.describe("Signed in user flows", () => {
  test("Opens homepage when logged in", async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    console.log("cookies", await page.context().cookies());
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Voeg recept toe")).toBeVisible();
  });
});