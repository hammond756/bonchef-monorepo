/**
 * TypeScript types for Instagram repost job functionality
 */

export interface InstagramConfig {
  facebookPageId: string
  systemUserAccessToken: string
  apiVersion: string
  baseUrl: string
}

export interface InstagramPostData {
  imageUrl: string
  caption: string
}

export interface InstagramMediaContainer {
  id: string
  statusCode: 'IN_PROGRESS' | 'FINISHED' | 'ERROR'
}

export interface InstagramPostResult {
  id: string
  success: boolean
  error?: string
  postUrl?: string
}

export interface RecipeData {
  id: string
  title: string
  source_name: string
  source_display_name: string // The actual name to use in captions (source_name or display_name)
  ingredients: Array<{
    name: string
    ingredients: Array<{
      quantity: { type: string; low: number; high: number }
      unit: string
      description: string
    }>
  }>
  instructions: string[]
  thumbnail: string
  is_public: boolean
}

export type CaptionGenerationResult = {
  success: true
  caption: string
} | {
  success: false
  error: string
}

export interface EmailNotificationData {
  to: string
  subject: string
  body: string
}

export interface JobConfig {
  retryAttempts: number
  retryDelayMs: number
}

export interface QueueItem {
  id: string
  recipe_id: string
  scheduled_date: string
  is_posted: boolean
  posted_at?: string
  instagram_post_id?: string
  instagram_post_url?: string
  error_message?: string
  created_at: string
  updated_at: string
}
