/**
 * Main Instagram repost worker that processes the recipe repost queue
 */

import { createClient } from '@supabase/supabase-js'
import { InstagramService } from './instagram-service.js'
import { CaptionGenerator } from './caption-generator.js'
import { EmailService } from './email-service.js'
import { 
  InstagramConfig, 
  RecipeData, 
  QueueItem, 
  JobConfig,
  InstagramPostData 
} from './types.js'

export class InstagramWorker {
  private supabase: any
  private instagramService: InstagramService
  private captionGenerator: CaptionGenerator
  private emailService: EmailService
  private config: JobConfig
  private isRunning: boolean = false
  private dryRun: boolean = false

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    instagramConfig: InstagramConfig,
    langfuseConfig: {
      publicKey: string
      secretKey: string
      host: string
    },
    emailConfig: {
      zohoUser: string
      zohoPass: string
      supportEmail: string
    },
    jobConfig: JobConfig,
    dryRun: boolean = false
  ) {
    // TODO: separate clients for admin tasks and should-have-public-access tasks
    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
    this.instagramService = new InstagramService(instagramConfig)
    this.captionGenerator = new CaptionGenerator(
      langfuseConfig.publicKey,
      langfuseConfig.secretKey,
      langfuseConfig.host
    )
    this.emailService = new EmailService(emailConfig)
    this.config = jobConfig
    this.dryRun = dryRun
  }

  /**
   * Initialize the worker
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Instagram worker...')
      await this.instagramService.initialize()
      console.log('Instagram worker initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Instagram worker:', error)
      throw error
    }
  }

  /**
   * Start the worker to process scheduled posts
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Worker is already running')
      return
    }

    this.isRunning = true
    console.log('Starting Instagram worker...')

    try {
      await this.processScheduledPosts()
    } catch (error) {
      console.error('Error in worker:', error)
      await this.sendErrorNotification('Worker error', error instanceof Error ? error : new Error(String(error)))
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Stop the worker
   */
  stop(): void {
    this.isRunning = false
    console.log('Instagram worker stopped')
  }

  /**
   * Process all scheduled posts that are due
   */
  private async processScheduledPosts(): Promise<void> {
    try {
      const scheduledPosts = await this.fetchScheduledPosts()
      console.log(`Found ${scheduledPosts.length} scheduled posts to process`)

      for (const post of scheduledPosts) {
        try {
          await this.processPost(post)
        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error)
          await this.handlePostError(post, error instanceof Error ? error : new Error(String(error)))
        }
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      throw error
    }
  }

  /**
   * Fetch posts that are scheduled and not yet posted
   */
  private async fetchScheduledPosts(): Promise<QueueItem[]> {
    
    const { data, error } = await this.supabase
      .from('recipe_repost_queue')
      .select('*')
      .eq('is_posted', false)
      .order('created_at', { ascending: true })
      .limit(1)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  }

  /**
   * Process a single post
   */
  private async processPost(queueItem: QueueItem): Promise<void> {
    console.log(`Processing post ${queueItem.id} for recipe ${queueItem.recipe_id}`)

    try {
      // Fetch recipe data
      const recipe = await this.fetchRecipeData(queueItem.recipe_id)
      if (!recipe) {
        throw new Error(`Recipe ${queueItem.recipe_id} not found`)
      }

      // Validate recipe is public
      if (!recipe.is_public) {
        throw new Error(`Recipe ${queueItem.recipe_id} is not public`)
      }

      // Validate image URL is publicly accessible
      if (!this.isPubliclyAccessible(recipe.thumbnail) && !this.dryRun) {
        throw new Error(`Recipe image is not publicly accessible: ${recipe.thumbnail}`)
      }

      // Generate caption
      console.log('Generating caption...')
      const captionResult = await this.captionGenerator.generateCaption(recipe)
      if (!captionResult.success) {
        throw new Error(`Caption generation failed: ${captionResult.error}`)
      }

      // Prepare post data
      const postData: InstagramPostData = {
        imageUrl: recipe.thumbnail,
        caption: captionResult.caption
      }

      if (this.dryRun) {
        // DRY RUN MODE: Log what would be posted without actually posting
        console.log('\n🔍 DRY RUN MODE - Would post to Instagram:')
        console.log('=' .repeat(60))
        console.log(`📸 Image URL: ${postData.imageUrl}`)
        console.log(`📝 Caption (${captionResult.caption.length} chars):`)
        console.log('─' .repeat(40))
        console.log(postData.caption)
        console.log('─' .repeat(40))
        console.log('✅ Dry run completed - no actual post made')
        console.log('=' .repeat(60))
        
        // In dry run mode, we still update the database to mark as "posted" for testing
        // but with a fake Instagram post ID
        await this.updatePostSuccess(
          queueItem.id, 
          `dry-run-${Date.now()}`, 
          'https://www.instagram.com/p/dry-run-test/'
        )
        console.log(`✅ Dry run: Recipe ${queueItem.recipe_id} would have been posted to Instagram`)
        return
      }

      // Post to Instagram with retry logic
      console.log('Posting to Instagram...')
      const postResult = await this.postWithRetry(postData)

      if (postResult.success) {
        // Update database with success
        await this.updatePostSuccess(queueItem.id, postResult.id!, postResult.postUrl!)
        console.log(`Successfully posted recipe ${queueItem.recipe_id} to Instagram`)
      } else {
        throw new Error(`Instagram posting failed: ${postResult.error}`)
      }
    } catch (error) {
      console.error(`Error processing post ${queueItem.id}:`, error)
      throw error
    }
  }

  /**
   * Fetch recipe data from database with source name logic
   */
  private async fetchRecipeData(recipeId: string): Promise<RecipeData | null> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        id,
        title,
        source_name,
        ingredients,
        instructions,
        thumbnail,
        is_public,
        user_id,
        profiles!recipes_user_id_fkey (
          display_name
        )
      `)
      .eq('id', recipeId)
      .single()

    if (error) {
      console.error(`Error fetching recipe ${recipeId}:`, error)
      return null
    }

    // Determine the source display name: use source_name if available, otherwise use display_name
    const sourceDisplayName = data.source_name && data.source_name.trim() !== '' 
      ? data.source_name 
      : data.profiles?.display_name || 'Onbekend'

    return {
      ...data,
      source_display_name: sourceDisplayName
    }
  }

  /**
   * Check if image URL is publicly accessible
   */
  private isPubliclyAccessible(imageUrl: string): boolean {
    try {
      const url = new URL(imageUrl)
      // Check if it's a valid URL and not localhost
      return url.protocol === 'https:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1') && url.pathname.includes('public')
    } catch {
      return false
    }
  }

  /**
   * Post to Instagram with retry logic
   */
  private async postWithRetry(postData: InstagramPostData): Promise<{ success: boolean; id?: string; postUrl?: string; error?: string }> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`Instagram post attempt ${attempt}/${this.config.retryAttempts}`)
        const result = await this.instagramService.postRecipe(postData)
        
        if (result.success) {
          return result
        } else {
          lastError = new Error(result.error || 'Unknown error')
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.error(`Attempt ${attempt} failed:`, lastError.message)
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.config.retryAttempts) {
        console.log(`Waiting ${this.config.retryDelayMs}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs))
      }
    }

    return {
      success: false,
      error: lastError?.message || 'All retry attempts failed'
    }
  }

  /**
   * Update database with successful post
   */
  private async updatePostSuccess(queueId: string, instagramPostId: string, instagramPostUrl: string): Promise<void> {
    const { error } = await this.supabase
      .from('recipe_repost_queue')
      .update({
        is_posted: true,
        posted_at: new Date().toISOString(),
        instagram_post_id: instagramPostId,
        instagram_post_url: instagramPostUrl,
        error_message: null
      })
      .eq('id', queueId)

    if (error) {
      console.error(`Error updating post success for ${queueId}:`, error)
      throw error
    }
  }

  /**
   * Handle post error
   */
  private async handlePostError(queueItem: QueueItem, error: Error): Promise<void> {
    console.error(`Handling error for post ${queueItem.id}:`, error)

    // Update database with error
    await this.updatePostError(queueItem.id, error.message)

    // Send email notification
    await this.sendErrorNotification(
      `Instagram post failed for recipe ${queueItem.recipe_id}`,
      error
    )
  }

  /**
   * Update database with error
   */
  private async updatePostError(queueId: string, errorMessage: string): Promise<void> {
    const { error } = await this.supabase
      .from('recipe_repost_queue')
      .update({
        error_message: errorMessage
      })
      .eq('id', queueId)

    if (error) {
      console.error(`Error updating post error for ${queueId}:`, error)
    }
  }

  /**
   * Send error notification email
   */
  private async sendErrorNotification(subject: string, error: Error): Promise<void> {
    try {
      await this.emailService.sendErrorNotification(subject, error.message)
    } catch (emailError) {
      console.error('Failed to send error notification:', emailError)
    }
  }

  /**
   * Get worker status
   */
  getStatus(): { isRunning: boolean; config: JobConfig } {
    return {
      isRunning: this.isRunning,
      config: this.config
    }
  }
}
