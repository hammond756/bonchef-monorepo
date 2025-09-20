/**
 * AI Caption Generator service using Langfuse for Instagram posts
 */

import Langfuse from 'langfuse'
import OpenAI from 'openai'
import { RecipeData, CaptionGenerationResult } from './types.js'

export class CaptionGenerator {
  private langfuse: Langfuse
  private openai: OpenAI
  private maxCaptionLength: number = 2200

  constructor(
    langfusePublicKey: string,
    langfuseSecretKey: string,
    langfuseHost: string = 'https://cloud.langfuse.com'
  ) {
    this.langfuse = new Langfuse({
      publicKey: langfusePublicKey,
      secretKey: langfuseSecretKey,
      baseUrl: langfuseHost
    })
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generate Instagram caption for a recipe using Langfuse prompt
   */
  async generateCaption(recipe: RecipeData): Promise<CaptionGenerationResult> {
    try {
      // Determine the source name to use: source_name if available, otherwise display_name
      const sourceName = recipe.source_name && recipe.source_name.trim() !== '' 
        ? recipe.source_name 
        : recipe.source_display_name || 'Onbekend'

      // Get the InstagramCaption prompt from Langfuse
      const promptClient = await this.langfuse.getPrompt("InstagramCaption", undefined, {
        type: "text"
      })

      // Compile the prompt to get the raw template
      let promptText = await promptClient.compile({
        recipe_title: recipe.title,
        sourceName: sourceName,
        ingredients: this.formatIngredients(recipe.ingredients),
        instructions: recipe.instructions.join('\n• ')
      })

      // Debug: Log the filled prompt
      console.log('🔍 Debug - Filled prompt:')
      console.log(promptText.substring(0, 500) + '...')

      // Use OpenAI to generate the actual caption
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: promptText
          },
          {
            role: "user",
            content: "Generate the Instagram caption based on the prompt above."
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      let generatedCaption = response.choices[0]?.message?.content || ''

      // Validate caption length
      const validation = this.validateCaptionLength(generatedCaption)
      if (!validation.valid) {
        const truncatedCaption = this.truncateCaption(generatedCaption)
        return {
          success: true as const,
          caption: truncatedCaption
        }
      }

      return {
        success: true as const,
        caption: generatedCaption
      }

    } catch (error) {
      console.error('Error generating caption:', error)
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Format ingredients array into a readable string
   */
  private formatIngredients(ingredients: any[]): string {
    // Handle the complex ingredients structure from the database
    if (!ingredients || !Array.isArray(ingredients)) {
      return '• Geen ingrediënten beschikbaar'
    }

    const formattedIngredients = ingredients.map(ingredient => {
      if (typeof ingredient === 'string') {
        return `• ${ingredient}`
      } else if (ingredient && typeof ingredient === 'object' && ingredient.name) {
        // Handle the complex structure: { name: string, ingredients: Array<{...}> }
        const subIngredients = ingredient.ingredients?.map((sub: any) => 
          `${sub.quantity?.low || ''} ${sub.unit || ''} ${sub.description || ''}`.trim()
        ).join(', ') || ''
        
        return `• ${ingredient.name}${subIngredients ? ': ' + subIngredients : ''}`
      } else {
        return `• ${JSON.stringify(ingredient)}`
      }
    }).join('\n')

    return formattedIngredients || '• Geen ingrediënten beschikbaar'
  }

  /**
   * Truncate caption if it exceeds maximum length
   */
  private truncateCaption(caption: string): string {
    if (caption.length <= this.maxCaptionLength) {
      return caption
    }

    // Try to truncate at a natural break point (sentence end)
    const truncated = caption.substring(0, this.maxCaptionLength - 50) // Leave some buffer
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )

    if (lastSentenceEnd > this.maxCaptionLength * 0.7) {
      // If we found a good break point, use it
      return caption.substring(0, lastSentenceEnd + 1)
    } else {
      // Otherwise, just truncate and add ellipsis
      return caption.substring(0, this.maxCaptionLength - 3) + '...'
    }
  }

  /**
   * Validate caption length
   */
  validateCaptionLength(caption: string): { valid: boolean; length: number; maxLength: number } {
    return {
      valid: caption.length <= this.maxCaptionLength,
      length: caption.length,
      maxLength: this.maxCaptionLength
    }
  }

  /**
   * Generate a mock caption for testing purposes
   */
  generateMockCaption(recipe: RecipeData): CaptionGenerationResult {
    const mockCaption = `🍽️ ${recipe.title} van ${recipe.source_display_name}

Een heerlijk recept dat perfect is voor elke gelegenheid! De combinatie van verse ingrediënten zorgt voor een smaakexplosie die je niet wilt missen.

👨‍🍳 Bereid door: ${recipe.source_display_name}
⏱️ Makkelijk te maken en perfect voor het hele gezin

#recept #koken #lekker #${recipe.title.toLowerCase().replace(/\s+/g, '')} #bonchef #foodie #homecooking #instafood #cooking #recipe`

    return {
      success: true as const,
      caption: mockCaption
    }
  }
}