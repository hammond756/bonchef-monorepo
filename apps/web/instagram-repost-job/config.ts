/**
 * Configuration management for Instagram repost job
 */

import { InstagramConfig, JobConfig } from './types.js'

export interface AppConfig {
  instagram: InstagramConfig
  job: JobConfig
  database: {
    url: string
    serviceKey: string
  }
  langfuse: {
    publicKey: string
    secretKey: string
    host: string
  }
  email: {
    zohoUser: string
    zohoPass: string
    supportEmail: string
  }
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): AppConfig {
  const requiredEnvVars = [
    'FACEBOOK_PAGE_ID',
    'SYSTEM_USER_ACCESS_TOKEN',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LANGFUSE_PUBLIC_KEY',
    'LANGFUSE_SECRET_KEY',
    'ZOHO_USER',
    'ZOHO_PASS',
    'SUPPORT_EMAIL'
  ]

  // Check for required environment variables
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return {
    instagram: {
      facebookPageId: process.env.FACEBOOK_PAGE_ID!,
      systemUserAccessToken: process.env.SYSTEM_USER_ACCESS_TOKEN!,
      apiVersion: process.env.INSTAGRAM_API_VERSION || 'v23.0',
      baseUrl: 'https://graph.facebook.com'
    },
    job: {
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
      retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000')
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    },
    langfuse: {
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      host: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
    },
    email: {
      zohoUser: process.env.ZOHO_USER!,
      zohoPass: process.env.ZOHO_PASS!,
      supportEmail: process.env.SUPPORT_EMAIL!
    }
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate Instagram config
  if (!config.instagram.facebookPageId) {
    errors.push('Facebook Page ID is required')
  }
  if (!config.instagram.systemUserAccessToken) {
    errors.push('System User Access Token is required')
  }

  // Validate database config
  if (!config.database.url) {
    errors.push('Supabase URL is required')
  }
  if (!config.database.serviceKey) {
    errors.push('Supabase Service Role Key is required')
  }

  // Validate Langfuse config
  if (!config.langfuse.publicKey) {
    errors.push('Langfuse Public Key is required')
  }
  if (!config.langfuse.secretKey) {
    errors.push('Langfuse Secret Key is required')
  }

  // Validate email config
  if (!config.email.zohoUser) {
    errors.push('Zoho User is required')
  }
  if (!config.email.zohoPass) {
    errors.push('Zoho Password is required')
  }
  if (!config.email.supportEmail) {
    errors.push('Support Email is required')
  }

  // Validate job config
  if (config.job.retryAttempts < 1 || config.job.retryAttempts > 10) {
    errors.push('Retry attempts must be between 1 and 10')
  }
  if (config.job.retryDelayMs < 1000 || config.job.retryDelayMs > 60000) {
    errors.push('Retry delay must be between 1000ms and 60000ms')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}


/**
 * Create a sample .env file content
 */
export function generateEnvTemplate(): string {
  return `# Instagram API Configuration
FACEBOOK_PAGE_ID=your_facebook_page_id
SYSTEM_USER_ACCESS_TOKEN=your_system_user_access_token
INSTAGRAM_API_VERSION=v23.0

# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com

# Email Configuration (Zoho Mail with secure TLS/SSL)
ZOHO_USER=your_zoho_email@bonchef.io
ZOHO_PASS=your_zoho_app_password
SUPPORT_EMAIL=support@bonchef.io

# Job Configuration
RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
`
}
