/**
 * Instagram API service for posting recipes to Instagram using Meta Business Suite API
 */

import { InstagramConfig, InstagramPostData, InstagramMediaContainer, InstagramPostResult } from './types.js'

export class InstagramService {
  private config: InstagramConfig
  private instagramUserId: string | null = null

  constructor(config: InstagramConfig) {
    this.config = config
  }

  /**
   * Initialize the service by fetching the Instagram Business ID
   */
  async initialize(): Promise<void> {
    try {
      this.instagramUserId = await this.getInstagramBusinessId()
      console.log(`Instagram service initialized with Business ID: ${this.instagramUserId}`)
    } catch (error) {
      console.error('Failed to initialize Instagram service:', error)
      throw new Error(`Instagram initialization failed: ${error}`)
    }
  }

  /**
   * Get Instagram Business ID from Facebook Page ID
   */
  private async getInstagramBusinessId(): Promise<string> {
    const url = `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.facebookPageId}?fields=instagram_business_account&access_token=${this.config.systemUserAccessToken}`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Facebook API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (!data.instagram_business_account?.id) {
        throw new Error('No Instagram Business Account found for this Facebook Page')
      }

      return data.instagram_business_account.id
    } catch (error) {
      console.error('Error fetching Instagram Business ID:', error)
      throw error
    }
  }

  /**
   * Create a media container for Instagram post
   */
  async createMediaContainer(postData: InstagramPostData): Promise<string> {
    if (!this.instagramUserId) {
      throw new Error('Instagram service not initialized. Call initialize() first.')
    }

    const url = `${this.config.baseUrl}/${this.config.apiVersion}/${this.instagramUserId}/media`
    
    const formData = new FormData()
    formData.append('image_url', postData.imageUrl)
    formData.append('caption', postData.caption)
    formData.append('access_token', this.config.systemUserAccessToken)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Instagram API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (!data.id) {
        throw new Error('No creation ID returned from Instagram API')
      }

      return data.id
    } catch (error) {
      console.error('Error creating media container:', error)
      throw error
    }
  }

  /**
   * Check the status of a media container
   */
  async checkContainerStatus(creationId: string): Promise<InstagramMediaContainer> {
    const url = `${this.config.baseUrl}/${this.config.apiVersion}/${creationId}?fields=status_code&access_token=${this.config.systemUserAccessToken}`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Instagram API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      return {
        id: creationId,
        statusCode: data.status_code
      }
    } catch (error) {
      console.error('Error checking container status:', error)
      throw error
    }
  }

  /**
   * Publish a media container to Instagram
   */
  async publishMediaContainer(creationId: string): Promise<InstagramPostResult> {
    if (!this.instagramUserId) {
      throw new Error('Instagram service not initialized. Call initialize() first.')
    }

    const url = `${this.config.baseUrl}/${this.config.apiVersion}/${this.instagramUserId}/media_publish`
    
    const formData = new FormData()
    formData.append('creation_id', creationId)
    formData.append('access_token', this.config.systemUserAccessToken)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Instagram API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        success: true,
        postUrl: `https://www.instagram.com/p/${data.id}/`
      }
    } catch (error) {
      console.error('Error publishing media container:', error)
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Post a recipe to Instagram with the complete flow
   */
  async postRecipe(postData: InstagramPostData): Promise<InstagramPostResult> {
    try {
      // Step 1: Create media container
      console.log('Creating media container...')
      const creationId = await this.createMediaContainer(postData)
      
      // Step 2: Wait 1-2 seconds and check status
      console.log('Waiting for container processing...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 3: Check container status
      console.log('Checking container status...')
      const containerStatus = await this.checkContainerStatus(creationId)
      
      if (containerStatus.statusCode !== 'FINISHED') {
        throw new Error(`Container not ready. Status: ${containerStatus.statusCode}`)
      }
      
      // Step 4: Publish the container
      console.log('Publishing to Instagram...')
      const result = await this.publishMediaContainer(creationId)
      
      if (result.success) {
        console.log(`Successfully posted to Instagram: ${result.postUrl}`)
      }
      
      return result
    } catch (error) {
      console.error('Error posting recipe to Instagram:', error)
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
