import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env.test") })

export default defineConfig({
    testDir: "./src/tests",
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: process.env.NEXT_PUBLIC_SITE_URL,
        trace: "on-first-retry",
        video: "on-first-retry",
    },
    projects: [
        // Setup project
        { name: "setup", testMatch: /.*\.setup\.ts/ },

        // Main test projects with first user authentication
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
            dependencies: ["setup"],
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
    },
})
