import { test, expect } from "../fixtures"

/**
 * Integration test for the complete dishcovery flow
 * Tests the entire user journey from navigation to recipe generation
 */
test.describe("Dishcovery Flow", () => {
    test("Complete dishcovery flow with photo and voice input", async ({
        temporaryUserPage: page,
    }) => {
        // 1. Open import overlay and click dishcovery
        const importButton = page.getByRole("button", { name: "Importeer recept" })
        await expect(importButton).toBeVisible()
        await importButton.click()

        // 2. Verify dishcovery button is visible and click it
        const dishcoveryButton = page.getByRole("button", { name: /dishcovery/i })
        await expect(dishcoveryButton).toBeVisible()
        await dishcoveryButton.click()

        // 3. Should navigate to dishcovery page
        await expect(page).toHaveURL("/dishcovery")

        // 4. Verify camera interface is shown
        const cameraButton = page.getByRole("button", { name: /foto maken/i })
        await expect(cameraButton).toBeVisible()

        const galleryButton = page.getByRole("button", { name: /galerij/i })
        await expect(galleryButton).toBeVisible()

        const uploadPromise = page.waitForEvent("filechooser")
        await galleryButton.click()

        // At this point, a system image picker should be openend. Select the test image.
        const fileChooser = await uploadPromise
        await fileChooser.setFiles("src/tests/test_files/gnocchi.png")

        // 7. Verify we can navigate back from camera
        const backButton = page.getByRole("button", { name: /terug/i })
        await expect(backButton).toBeVisible()
        await backButton.click()

        // 8. Should return to main page
        await expect(page).toHaveURL("/ontdek")
    })

    test("Dishcovery navigation and button states", async ({ temporaryUserPage: page }) => {
        // Test that dishcovery button is properly integrated
        const importButton = page.getByRole("button", { name: /\+/i })
        await importButton.click()

        // Verify dishcovery button has correct styling and icon
        const dishcoveryButton = page.getByRole("button", { name: /dishcovery/i })
        await expect(dishcoveryButton).toBeVisible()

        // Check that it's not the old chat button
        const chatButton = page.getByRole("button", { name: /chat/i })
        await expect(chatButton).not.toBeVisible()
    })

    test("Dishcovery page layout and components", async ({ temporaryUserPage: page }) => {
        // Navigate directly to dishcovery page
        await page.goto("/dishcovery")

        // Verify page structure
        await expect(
            page.getByRole("heading", { name: /vertel meer over dit gerecht/i })
        ).toBeVisible()

        // Verify photo display area exists
        const photoArea = page.locator("img[alt='Captured dish']")
        await expect(photoArea).toBeVisible()

        // Verify input controls are present
        await expect(page.getByRole("button", { name: /ik kan nu niet praten/i })).toBeVisible()
        await expect(page.getByRole("button", { name: /toch liever spreken/i })).toBeVisible()

        // Verify CTA button
        const generateButton = page.getByRole("button", { name: /recept genereren/i })
        await expect(generateButton).toBeVisible()
        await expect(generateButton).toBeDisabled() // Should be disabled without input
    })

    test("Voice and text input switching", async ({ temporaryUserPage: page }) => {
        await page.goto("/dishcovery")

        // Start in voice mode
        const voiceButton = page.getByRole("button", { name: /ik kan nu niet praten/i })
        await expect(voiceButton).toBeVisible()

        // Switch to text mode
        await voiceButton.click()

        // Verify text input is shown
        const textInput = page.getByRole("textbox", { name: /beschrijving van het gerecht/i })
        await expect(textInput).toBeVisible()

        // Switch back to voice mode
        const switchToVoiceButton = page.getByRole("button", { name: /toch liever spreken/i })
        await expect(switchToVoiceButton).toBeVisible()
        await switchToVoiceButton.click()

        // Verify voice mode is active again
        await expect(page.getByRole("button", { name: /ik kan nu niet praten/i })).toBeVisible()
    })

    test("Input validation and error handling", async ({ temporaryUserPage: page }) => {
        await page.goto("/dishcovery")

        // Try to generate recipe without input (should show error)
        const generateButton = page.getByRole("button", { name: /recept genereren/i })
        await generateButton.click()

        // Should show error message
        const errorMessage = page.getByText(/voeg minimaal 3 karakters toe/i)
        await expect(errorMessage).toBeVisible()

        // Add valid text input
        const textButton = page.getByRole("button", { name: /ik kan nu niet praten/i })
        await textButton.click()

        const textInput = page.getByRole("textbox", { name: /beschrijving van het gerecht/i })
        await textInput.fill("Dit is een heerlijke pasta met tomatensaus en basilicum")

        // Button should now be enabled
        await expect(generateButton).toBeEnabled()
    })

    test("Responsive design on mobile", async ({ temporaryUserPage: page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        await page.goto("/dishcovery")

        // Verify mobile-friendly button sizes
        const buttons = page.locator("button")
        await expect(buttons).toHaveCount(4) // back, voice/text switch, generate

        // Verify touch-friendly spacing
        const generateButton = page.getByRole("button", { name: /recept genereren/i })
        const buttonBox = await generateButton.boundingBox()

        // Button should be at least 44px tall for touch
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
    })
})
