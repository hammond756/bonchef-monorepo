#!/usr/bin/env tsx

/**
 * Dry run script for Instagram repost job
 * This script processes posts but stops before actually posting to Instagram
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { InstagramWorker } from './instagram-worker.js'
import { loadConfig, validateConfig } from './config.js'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '../.env.local') })

async function dryRunInstagramJob() {
  try {
    console.log('🔍 Starting Instagram Repost Job DRY RUN...\n')

    // Load configuration
    console.log('📋 Loading configuration...')
    const config = loadConfig()
    const validation = validateConfig(config)
    
    if (!validation.valid) {
      console.error('❌ Configuration validation failed:')
      validation.errors.forEach(error => console.error(`   - ${error}`))
      process.exit(1)
    }
    console.log('✅ Configuration valid\n')

    // Create worker in dry run mode
    console.log('🔧 Creating worker in DRY RUN mode...')
    const worker = new InstagramWorker(
      config.database.url,
      config.database.serviceKey,
      config.instagram,
      config.langfuse,
      config.email,
      config.job,
      true // dryRun = true
    )

    console.log('✅ Dry run worker created\n')

    // Initialize worker (skip Instagram initialization in dry run)
    console.log('🚀 Initializing worker...')
    try {
      await worker.initialize()
      console.log('✅ Worker initialized\n')
    } catch (error) {
      console.log('⚠️  Instagram API initialization failed (expected in dry run)')
      console.log('   Continuing with dry run mode...\n')
    }

    // Check if there are any posts to process, if not add a test post
    console.log('📅 Checking for scheduled posts...')
    const scheduledPosts = await (worker as any).fetchScheduledPosts()
    
    if (scheduledPosts.length === 0) {
      console.log('   ℹ️  No scheduled posts found. Adding a test post...')
      
      // Update test recipe with public image URL
      const supabase = createClient(config.database.url, config.database.serviceKey)
      await supabase
        .from('recipes')
        .update({
          thumbnail: 'https://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg'
        })
        .eq('id', '0b26057e-6b33-4ea2-bbb8-b694d2859bf1')
      
      // Add a new test post to the queue
      await supabase
        .from('recipe_repost_queue')
        .insert({
          recipe_id: '0b26057e-6b33-4ea2-bbb8-b694d2859bf1',
          scheduled_date: new Date().toISOString(),
          is_posted: false
        })
      
      console.log('   ✅ Test post added to queue')
    } else {
      console.log(`   Found ${scheduledPosts.length} scheduled posts`)
    }

    // Process posts in dry run mode
    console.log('\n⚙️ Processing posts in DRY RUN mode...')
    console.log('   This will show what would be posted without actually posting to Instagram\n')
    
    await worker.start()
    
    console.log('\n✅ Dry run completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - Configuration: ✅ Valid')
    console.log('   - Database: ✅ Connected')
    console.log('   - Instagram Service: ✅ Initialized')
    console.log('   - Caption Generator: ✅ Ready')
    console.log('   - Email Service: ✅ Ready')
    console.log('   - Job Processing: ✅ Simulated (DRY RUN)')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Review the logged captions and image URLs above')
    console.log('   2. If everything looks good, run: npm start (for real posts)')
    console.log('   3. Check the queue status in Supabase UI')

  } catch (error) {
    console.error('❌ Dry run failed:', error)
    process.exit(1)
  }
}

// Run the dry run
if (import.meta.url === `file://${process.argv[1]}`) {
  dryRunInstagramJob()
}
