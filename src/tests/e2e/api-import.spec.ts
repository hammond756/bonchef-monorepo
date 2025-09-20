import { Page } from "@playwright/test"
import { test, expect } from "../fixtures"

/**
 * Extracts the Supabase session data from the browser cookies on the test page.
 * This avoids using client-side Supabase and instead parses the session JWT directly.
 */
const getAccessTokenFromTestPage = async (page: Page) => {
    // Supabase stores the session in a cookie named `sb-<project-ref>-auth-token`
    const cookies = await page.context().cookies()
    const supabaseAuthCookie = cookies.find(
        (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
    )
    if (!supabaseAuthCookie) return null

    try {
        const encodedSession = supabaseAuthCookie.value.split("-")[1]
        return JSON.parse(atob(encodedSession))
    } catch {
        return null
    }
}

test.describe("API-based Recipe Import", () => {
    test("should successfully trigger import job via API with bearer token", async ({
        temporaryUserPage: page,
        unauthenticatedPage: unauthenticatedPage,
        baseURL,
    }) => {
        const { access_token: accessToken } = await getAccessTokenFromTestPage(page)
        expect(accessToken).toBeTruthy()

        // Test data
        const testText = "Pannenkoeken - Een heerlijk gerecht voor 4 personen."

        // Test text import via API
        const textResponse = await unauthenticatedPage.request.post(
            `${baseURL}/api/trigger-import-job`,
            {
                data: {
                    sourceType: "text",
                    sourceData: testText,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        )

        expect(textResponse.status()).toBe(200)
        const textResponseData = await textResponse.json()
        expect(textResponseData).toHaveProperty("jobId")
        expect(textResponseData.jobId).toBeTruthy()

        // Verify jobs appear in collection page
        await page.getByRole("link", { name: "Collectie" }).click()

        // Wait for the jobs to appear (they should show as "Concept" or processing)
        await expect(page.getByText("Concept")).toBeVisible({ timeout: 60000 })
    })

    test("should return 401 for unauthorized API requests", async ({ page, baseURL }) => {
        // Test without authentication
        const response = await page.request.post(`${baseURL}/api/trigger-import-job`, {
            data: {
                sourceType: "url",
                sourceData: "https://example.com",
            },
            headers: {
                "Content-Type": "application/json",
            },
        })

        expect(response.status()).toBe(401)
        const responseData = await response.json()
        expect(responseData).toHaveProperty("error", "Unauthorized")
    })

    test("should return 400 for invalid request data", async ({
        temporaryUserPage: page,
        baseURL,
    }) => {
        const { access_token: accessToken } = await getAccessTokenFromTestPage(page)
        expect(accessToken).toBeTruthy()

        // Test missing sourceType
        const missingSourceTypeResponse = await page.request.post(
            `${baseURL}/api/trigger-import-job`,
            {
                data: {
                    sourceData: "https://example.com",
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        )

        expect(missingSourceTypeResponse.status()).toBe(400)
        const missingSourceTypeData = await missingSourceTypeResponse.json()
        expect(missingSourceTypeData).toHaveProperty("error")
    })

    test("should handle invalid bearer token", async ({ page, baseURL }) => {
        // Test with invalid token
        const response = await page.request.post(`${baseURL}/api/trigger-import-job`, {
            data: {
                sourceType: "url",
                sourceData: "https://example.com",
            },
            headers: {
                Authorization: "Bearer invalid-token",
                "Content-Type": "application/json",
            },
        })

        expect(response.status()).toBe(401)
        const responseData = await response.json()
        expect(responseData).toHaveProperty("error", "Unauthorized")
    })
})
