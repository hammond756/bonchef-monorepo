#!/usr/bin/env tsx

/**
 * Update test recipe with public image URL for testing
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '../.env.local') })

async function updateTestImage() {
  try {
    console.log('🖼️ Updating test recipe with public image URL...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the test recipe with the public image URL
    const { data, error } = await supabase
      .from('recipes')
      .update({
        thumbnail: 'https://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg'
      })
      .eq('id', '0b26057e-6b33-4ea2-bbb8-b694d2859bf1')

    if (error) {
      console.error('❌ Error updating recipe:', error)
      return
    }

    // Add a new test post to the queue
    const { data: queueData, error: queueError } = await supabase
      .from('recipe_repost_queue')
      .insert({
        recipe_id: '0b26057e-6b33-4ea2-bbb8-b694d2859bf1',
        scheduled_date: new Date().toISOString(),
        is_posted: false
      })

    if (queueError) {
      console.error('❌ Error adding to queue:', queueError)
      return
    }

    console.log('✅ Recipe updated with public image URL')
    console.log('🖼️ Image URL: https://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the update
if (import.meta.url === `file://${process.argv[1]}`) {
  updateTestImage()
}
