import { test as base, Browser, BrowserContext, Page } from "@playwright/test"
import path from "path"

/**
 * Audio test fixture that provides a page with fake microphone input
 * Based on Playwright GitHub issues #27436 and #2525
 */
interface AudioFixtures {
    audioTestPage: Page
    audioTestContext: BrowserContext
    audioTestBrowser: Browser
    shortAudioTestPage: Page
    shortAudioTestContext: BrowserContext
    shortAudioTestBrowser: Browser
}

/**
 * Helper function to get the absolute path to the test audio file
 */
function getTestAudioPath(audioFile: string = "marokkaanse-pannenkoek.wav"): string {
    return path.resolve(process.cwd(), `src/tests/test_files/${audioFile}`)
}

/**
 * Audio test fixture that launches a browser with fake audio input
 *
 * Key insights from Playwright resources:
 * 1. The --use-file-for-fake-audio-capture flag must be set at browser launch level
 * 2. Cannot use test.use() as it breaks audio playback (GitHub issue #27436)
 * 3. Need proper camera and microphone permissions
 * 4. Audio file must be in WAV format with %noloop parameter
 */
export const audioTest = base.extend<AudioFixtures>({
    audioTestBrowser: async ({ playwright }, use) => {
        // Launch browser with fake audio capture configuration
        // This must be done at browser level, not in test.use()
        const browser = await playwright.chromium.launch({
            args: [
                "--use-fake-ui-for-media-stream",
                "--use-fake-device-for-media-stream",
                `--use-file-for-fake-audio-capture=${getTestAudioPath()}%noloop`,
                "--autoplay-policy=no-user-gesture-required",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
            ],
        })

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(browser)
        await browser.close()
    },

    audioTestContext: async ({ audioTestBrowser }, use) => {
        // Create context with necessary permissions for camera and microphone
        const context = await audioTestBrowser.newContext({
            permissions: ["camera", "microphone"],
            // Record video for debugging if needed
            recordVideo: {
                dir: "test-results/videos/audio-tests",
                size: { width: 1280, height: 720 },
            },
        })

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(context)
        await context.close()
    },

    audioTestPage: async ({ audioTestContext, baseURL }, use) => {
        const page = await audioTestContext.newPage()

        // Grant permissions to the page
        await page.context().grantPermissions(["camera", "microphone"], { origin: baseURL })

        // Navigate to the base URL
        await page.goto(baseURL!)

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(page)
    },

    shortAudioTestBrowser: async ({ playwright }, use) => {
        // Launch browser with 5-second fake audio capture configuration
        const browser = await playwright.chromium.launch({
            args: [
                "--use-fake-ui-for-media-stream",
                "--use-fake-device-for-media-stream",
                `--use-file-for-fake-audio-capture=${getTestAudioPath("marokkaanse-pannenkoek-8s.wav")}%noloop`,
                "--autoplay-policy=no-user-gesture-required",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
            ],
        })

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(browser)
        await browser.close()
    },

    shortAudioTestContext: async ({ shortAudioTestBrowser }, use) => {
        // Create context with necessary permissions for camera and microphone
        const context = await shortAudioTestBrowser.newContext({
            permissions: ["camera", "microphone"],
            // Record video for debugging if needed
            recordVideo: {
                dir: "test-results/videos/short-audio-tests",
                size: { width: 1280, height: 720 },
            },
        })

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(context)
        await context.close()
    },

    shortAudioTestPage: async ({ shortAudioTestContext, baseURL }, use) => {
        const page = await shortAudioTestContext.newPage()

        // Grant permissions to the page
        await page.context().grantPermissions(["camera", "microphone"], { origin: baseURL })

        // Navigate to the base URL
        await page.goto(baseURL!)

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(page)
    },
})

export { expect } from "@playwright/test"
