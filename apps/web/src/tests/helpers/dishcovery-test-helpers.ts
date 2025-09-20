import { Page, expect } from "@playwright/test"
import { loginWithTemporaryUser } from "../fixtures"

/**
 * Test image file path
 */
const TEST_IMAGE_PATH = "src/tests/test_files/marokkaanse-pannenkoek.jpg"

/**
 * Navigate to dishcovery page and verify it's loaded
 */
export async function navigateToDishcovery(page: Page, baseURL: string) {
    await loginWithTemporaryUser(page, baseURL)

    // 1. Open import overlay and click dishcovery
    const importButton = page.getByRole("button", { name: "Importeer recept" })
    await expect(importButton).toBeVisible()
    await importButton.click()

    // 2. Verify dishcovery button is visible and click it
    await page.getByRole("button", { name: /dishcovery/i }).click()

    // 3. Should navigate to dishcovery page
    await expect(page).toHaveURL("/dishcovery")

    // 4. Verify camera interface is shown
    const cameraButton = page.getByRole("button", { name: /foto maken/i })
    await expect(cameraButton).toBeVisible()
}

/**
 * Upload a test image via the gallery button
 */
export async function uploadTestImage(page: Page) {
    // 5. Upload a test image
    const uploadPromise = page.waitForEvent("filechooser")
    await page.getByRole("button", { name: /galerij/i }).click()
    const fileChooser = await uploadPromise
    await fileChooser.setFiles(TEST_IMAGE_PATH)
}

/**
 * Wait for audio recording to complete and stop recording
 */
export async function waitForAudioRecording(page: Page, duration: number) {
    // Wait for the fake audio to be processed
    // The fake audio will automatically play through the microphone
    await page.waitForTimeout(duration)

    // Stop recording (this might be automatic or require a button click)
    // Check if there's a stop button or if recording stops automatically
    await page.getByRole("button", { name: "Stop opname" }).click()
}

/**
 * Submit the dishcovery form and verify recipe creation
 */
export async function submitDishcoveryForm(page: Page) {
    // Submit the form
    await page.getByRole("button", { name: "Importeren" }).click()

    // Verify the recipe was created
    await expect(page.getByText("Concept")).toBeVisible({ timeout: 120000 })
}

/**
 * Complete dishcovery flow with voice input
 */
export async function completeDishcoveryWithVoiceInput(
    page: Page,
    baseURL: string,
    audioDuration: number
) {
    await navigateToDishcovery(page, baseURL)
    await uploadTestImage(page)
    await waitForAudioRecording(page, audioDuration)
    await submitDishcoveryForm(page)
}
