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
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Voeg recept toe")).toBeVisible();
  });
});

test.describe("Signup flows", () => {
  let testUserEmail: string | null = null;
  const testUserPassword = "test1234";

  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({}) => {
    testUserEmail = `test${Math.random().toString(36).substring(2)}@test.com`;
  });

    test("can navigate to signup page from login page", async ({ page, baseURL }) => {
        await page.goto(baseURL! + "/login");
        await page.getByText("Meld je dan hier aan").click();
        await expect(page).toHaveURL("/signup");
    });

    test("can sign up successfully", async ({ page, baseURL }) => {
        await page.goto(baseURL! + "/signup");
        await page.fill("input[type='email']", testUserEmail!);
        await page.fill("input[type='password']", testUserPassword);
        await page.fill("input[name='confirmPassword']", testUserPassword);
        await page.fill("input[name='displayName']", "Test User");
        await page.click("button[type='submit']");
        await expect(page).toHaveURL("/");
        await expect(page.getByText("Voeg recept toe")).toBeVisible();
    });

    test("homepage shows user email after signup", async ({ page, baseURL }) => {
        await page.goto(baseURL! + "/signup");
        await page.fill("input[type='email']", testUserEmail!);
        await page.fill("input[type='password']", testUserPassword);
        await page.fill("input[name='confirmPassword']", testUserPassword);
        await page.fill("input[name='displayName']", "Test User");
        await page.click("button[type='submit']");
        await expect(page).toHaveURL("/");
        await expect(page.getByText(testUserEmail!)).toBeVisible();
    });
});
