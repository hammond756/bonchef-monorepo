import { expect, test, Page } from "@playwright/test";

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
    });
    
});

test.describe("Signed in user flows", () => {
  test("Opens homepage when logged in", async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await expect(page).toHaveURL("/");
  });

  test("Logs out successfully", async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await expect(page).toHaveURL("/");
    await page.getByTestId("side-bar-hamburger-menu").click();
    await expect(page.getByText(process.env.TEST_USER_EMAIL!)).toBeVisible();
    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Signup flows", () => {
  let testUserEmail: string | null = null;
  const testUserPassword = "test1234";
  const displayName = "Test User";

  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async () => {
    testUserEmail = `test${Math.random().toString(36).substring(2)}@test.com`;
  });

  /**
   * Interface for signup form data
   */
  interface SignupFormData {
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }

  /**
   * Interface for signup test scenario options
   */
  interface SignupScenarioOptions {
    formData?: SignupFormData;
    expectedUrl?: string;
    afterHomepageAssertions?: (page: Page) => Promise<void>;
  }

  /**
   * Helper function to fill the signup form
   */
  async function fillSignupForm(
    page: Page, 
    baseURL: string, 
    {
      email = testUserEmail!,
      password = testUserPassword,
      confirmPassword = testUserPassword,
      name = displayName
    }: SignupFormData = {}
  ): Promise<void> {
    await page.goto(`${baseURL}/signup`);
    await page.fill("input[type='email']", email);
    await page.fill("input[type='password']", password);
    await page.fill("input[name='confirmPassword']", confirmPassword);
    await page.fill("input[name='displayName']", name);
    await page.click("button[type='submit']");
  }

  /**
   * Helper function to test signup with different scenarios
   */
  async function testSignupScenario(
    page: Page, 
    baseURL: string, 
    {
      formData = {},
      expectedUrl = "/",
      afterHomepageAssertions = (page) => Promise.resolve()
    }: SignupScenarioOptions = {}
  ): Promise<void> {
    await fillSignupForm(page, baseURL, formData);
    await expect(page).toHaveURL(expectedUrl);
    await afterHomepageAssertions(page);
  }

  test("can navigate to signup page from login page", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/login`);
    await page.getByText("Meld je dan hier aan").click();
    await expect(page).toHaveURL("/signup");
  });

  test("can sign up successfully", async ({ page, baseURL }) => {
    await testSignupScenario(page, baseURL!);
  });

  test("homepage shows user email after signup", async ({ page, baseURL }) => {
    await testSignupScenario(page, baseURL!, {
      afterHomepageAssertions: async (page) => {
        await page.getByTestId("side-bar-hamburger-menu").click();
        await expect(page.getByText(testUserEmail!)).toBeVisible();
      }
    });
  });

  // test("signup fails with invalid email", async ({ page, baseURL }) => {
  //   await testSignupScenario(page, baseURL!, {
  //     formData: { email: "invalid-email" },
  //     expectedUrl: "/signup",
  //     expectedMessage: "Ongeldig e-mailadres"
  //   });
  // });

  test("signup fails with mismatched passwords", async ({ page, baseURL }) => {
    await testSignupScenario(page, baseURL!, {
      formData: { confirmPassword: "wrong-password" },
      expectedUrl: "/signup",
    });
  });
});
