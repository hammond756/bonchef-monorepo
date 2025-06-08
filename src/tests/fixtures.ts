import { APIRequestContext, test as base, Page } from "@playwright/test";

/**
 * Helper function to log in a user
 */
async function loginUser(page: Page, baseURL: string, email: string, password: string) {
  await page.goto(baseURL + "/login");
  await page.fill("input[type='email']", email);
  await page.fill("input[type='password']", password);
  await page.click("button[type='submit']");
  await page.waitForURL("/");
}

/**
 * Define the custom fixtures
 */
interface CustomFixtures {
  unauthenticatedPage: Page;
  authenticatedPage: Page;
  secondUserPage: Page;
  authenticatedRequest: APIRequestContext;
}

/**
 * Extend the base test with authentication fixtures
 */
export const test = base.extend<CustomFixtures>({
  // Fixture for a page with no authentication
  unauthenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },

  // Fixture for a page with first test user authentication
  authenticatedPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginUser(
      page,
      baseURL!,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },

  // Fixture for a page with second test user authentication
  secondUserPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginUser(
      page,
      baseURL!,
      "test2@playwright.com",
      process.env.TEST_USER_PASSWORD!
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },

  authenticatedRequest: async ({ browser }, use) => {
    const context = await browser.newContext();
    const request = context.request;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(request);
    await context.close();
  },
});

export { expect } from "@playwright/test"; 