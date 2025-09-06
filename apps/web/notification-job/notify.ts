#!/usr/bin/env node

/**
 * Notification worker entry point for Heroku Scheduler
 * This script processes pending email notifications
 */

import { NotificationWorker } from "./notification-worker.js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: '.env.local' })

async function main() {
    console.log("Starting notification worker...")

    // Verify required environment variables
    const requiredEnvVars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY", 
        "POSTMARK_API_KEY"
    ]

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`Missing required environment variable: ${envVar}`)
            process.exit(1)
        }
    }

    try {
        const worker = new NotificationWorker()

        // Verify connections
        console.log("Verifying connections...")
        const connectionResult = await worker.verifyConnections()
        if (!connectionResult.success) {
            console.error("Connection verification failed:", connectionResult.error)
            process.exit(1)
        }
        console.log("Connections verified successfully")

        // Process notifications
        console.log("Processing notifications...")
        const result = await worker.processNotifications()
        
        if (!result.success) {
            console.error("Notification processing failed:", result.error)
            process.exit(1)
        }

        console.log("Notification processing completed:", result.data)
        process.exit(0)
    } catch (error) {
        console.error("Unexpected error in notification worker:", error)
        process.exit(1)
    }
}

// Run the worker
main().catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
}) 