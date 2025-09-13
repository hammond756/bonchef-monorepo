#!/usr/bin/env node

/**
 * Instagram Repost Job - Main entry point
 * 
 * This script runs the Instagram repost job to automatically post recipes
 * to Instagram at scheduled times.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { InstagramWorker } from './instagram-worker.js'
import { loadConfig, validateConfig } from './config.js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  try {
    // Check for help flag
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      console.log(`
Instagram Repost Job - Automatically post recipes to Instagram

Usage:
  npm start                    Run the job normally
  npm run dry-run             Run the job in dry-run mode (simulation)
  node index.js --dry-run     Run in dry-run mode
  node index.js --help        Show this help

Options:
  --dry-run, -d              Run in dry-run mode (no actual Instagram posts)
  --help, -h                 Show this help message

Dry-run mode:
  - Simulates the entire posting process
  - Updates database with mock Instagram post IDs
  - No actual posts are made to Instagram
  - Perfect for testing and development

Environment Variables:
  See .env.example for required configuration variables.
      `)
      process.exit(0)
    }

    // Check for dry-run mode
    const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d')
    
    if (isDryRun) {
      console.log('🧪 Starting Instagram Repost Job in DRY-RUN mode...')
      console.log('   This will simulate the entire flow without actually posting to Instagram\n')
    } else {
      console.log('🚀 Starting Instagram Repost Job...')
    }
    
    // Load and validate configuration
    const config = loadConfig()
    const validation = validateConfig(config)
    
    if (!validation.valid) {
      console.error('❌ Configuration validation failed:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
      process.exit(1)
    }
    
    console.log('✅ Configuration validated successfully')
    
    if (isDryRun) {
      console.log('🧪 Starting Instagram repost process in DRY-RUN mode...')
    } else {
      console.log('🚀 Starting Instagram repost process...')
    }
    
    // Initialize and start the worker
    const worker = new InstagramWorker(
      config.database.url,
      config.database.serviceKey,
      config.instagram,
      config.langfuse,
      config.email,
      config.job,
      isDryRun // Pass dry-run flag to worker
    )
    
    await worker.initialize()
    await worker.start()
    
    if (isDryRun) {
      console.log('✅ Instagram repost job completed successfully (DRY-RUN)')
      console.log('\n📊 Dry-run summary:')
      console.log('   - All posts were simulated without actually posting to Instagram')
      console.log('   - Database was updated with mock Instagram post IDs')
      console.log('   - No real Instagram posts were made')
      console.log('\n🎯 To run the actual job, use: npm start')
    } else {
      console.log('✅ Instagram repost job completed successfully')
    }
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Instagram repost job failed:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
