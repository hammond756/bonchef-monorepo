import { test, expect } from "../fixtures"
import { Page } from "@playwright/test"

test.describe("Authentication flows", () => {
    test("redirects to sign up when trying like a recipe", async ({
        unauthenticatedPage: page,
        baseURL,
    }) => {
        await page.goto(baseURL! + "/ontdek")
        await page.getByRole("button", { name: "Like" }).first().click()
        await expect(page).toHaveURL("/signup")
    })

    test("logs in successfully and redirects to homepage", async ({
        unauthenticatedPage: page,
        baseURL,
    }) => {
        await page.goto(baseURL! + "/login")

        await page.fill("input[type='email']", process.env.TEST_USER_EMAIL!)
        await page.fill("input[type='password']", process.env.TEST_USER_PASSWORD!)
        await page.click("button[type='submit']")

        await expect(page).toHaveURL("/ontdek")
    })
})

test.describe("Signed in user flows", () => {
    test("Opens homepage when logged in", async ({ authenticatedPage: page, baseURL }) => {
        await page.goto(baseURL!)
        await expect(page).toHaveURL("/ontdek")
        await expect(page.getByRole("link", { name: "Ga naar jouw profiel" })).toBeVisible()
    })

    test("Logs out successfully", async ({ temporaryUserPage: page, baseURL }) => {
        await page.goto(baseURL!)
        await expect(page).toHaveURL("/ontdek")

        const profileButton = await page.getByRole("link", { name: "Ga naar jouw profiel" })
        await profileButton.click()

        await page.getByRole("button", { name: "Uitloggen" }).click()

        await page.waitForLoadState("networkidle")

        // Check the browser session cookie is cleared
        const cookies = await page.context().cookies()
        const authCookie = cookies.find((c) => c.name === "sb-127-auth-token")
        expect(authCookie).toBeUndefined()
    })
})

test.describe("Signup flows", () => {
    let testUserEmail: string | null = null
    const testUserPassword = "test1234"
    const displayName = "Test User"

    test.beforeEach(async () => {
        testUserEmail = `test${Math.random().toString(36).substring(2)}@test.com`
    })

    /**
     * Interface for signup form data
     */
    interface SignupFormData {
        email?: string
        password?: string
        confirmPassword?: string
        name?: string
    }

    /**
     * Interface for signup test scenario options
     */
    interface SignupScenarioOptions {
        formData?: SignupFormData
        expectedUrl?: string
        afterHomepageAssertions?: (page: Page) => Promise<void>
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
            name = displayName,
        }: SignupFormData = {}
    ): Promise<void> {
        await page.goto(`${baseURL}/signup`)
        await page.fill("input[type='email']", email)
        await page.fill("input[type='password']", password)
        await page.fill("input[name='confirmPassword']", confirmPassword)
        await page.fill("input[name='displayName']", name)
        await page.click("button[type='submit']")
    }

    /**
     * Helper function to test signup with different scenarios
     */
    async function testSignupScenario(
        page: Page,
        baseURL: string,
        {
            formData = {},
            expectedUrl = "/ontdek",
            afterHomepageAssertions = () => Promise.resolve(),
        }: SignupScenarioOptions = {}
    ): Promise<void> {
        await fillSignupForm(page, baseURL, formData)
        await expect(page).toHaveURL(expectedUrl)
        await afterHomepageAssertions(page)
    }

    test("can navigate to signup page from login page", async ({
        unauthenticatedPage: page,
        baseURL,
    }) => {
        await page.goto(`${baseURL}/login`)
        await page.getByText("Meld je dan hier aan").click()
        await expect(page).toHaveURL("/signup")
    })

    test("can sign up successfully", async ({ unauthenticatedPage: page, baseURL }) => {
        await testSignupScenario(page, baseURL!)
    })

    test("homepage shows profile link after signup", async ({
        unauthenticatedPage: page,
        baseURL,
    }) => {
        await testSignupScenario(page, baseURL!, {
            afterHomepageAssertions: async (page) => {
                await expect(page.getByRole("link", { name: "Ga naar jouw profiel" })).toBeVisible()
            },
        })
    })

    // test("signup fails with invalid email", async ({ page, baseURL }) => {
    //   await testSignupScenario(page, baseURL!, {
    //     formData: { email: "invalid-email" },
    //     expectedUrl: "/signup",
    //     expectedMessage: "Ongeldig e-mailadres"
    //   });
    // });

    test("signup fails with mismatched passwords", async ({
        unauthenticatedPage: page,
        baseURL,
    }) => {
        await testSignupScenario(page, baseURL!, {
            formData: { confirmPassword: "wrong-password" },
            expectedUrl: "/signup",
        })
    })
})
