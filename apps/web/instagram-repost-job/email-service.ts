/**
 * Email notification service for error reporting
 */

import nodemailer from 'nodemailer'
import { EmailNotificationData } from './types.js'

export class EmailService {
  private zohoUser: string
  private zohoPass: string
  private supportEmail: string
  private transporter: nodemailer.Transporter

  constructor(config: {
    zohoUser: string
    zohoPass: string
    supportEmail: string
  }) {
    this.zohoUser = config.zohoUser
    this.zohoPass = config.zohoPass
    this.supportEmail = config.supportEmail

    // Create Zoho Mail SMTP transporter with secure TLS/SSL
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 465, // Use secure port 465 for SSL/TLS
      secure: true, // Use SSL/TLS encryption
      auth: {
        user: this.zohoUser,
        pass: this.zohoPass
      },
      tls: {
        // Modern TLS security options
        ciphers: 'TLSv1.2',
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    })
  }

  /**
   * Send error notification email
   */
  async sendErrorNotification(subject: string, errorMessage: string): Promise<void> {
    const emailData: EmailNotificationData = {
      to: this.supportEmail,
      subject: `[Instagram Repost Job] ${subject}`,
      body: this.buildErrorEmailBody(subject, errorMessage)
    }

    await this.sendEmail(emailData)
  }

  /**
   * Send general notification email
   */
  async sendNotification(to: string, subject: string, body: string): Promise<void> {
    const emailData: EmailNotificationData = {
      to,
      subject,
      body
    }

    await this.sendEmail(emailData)
  }

  /**
   * Build error email body with proper formatting
   */
  private buildErrorEmailBody(subject: string, errorMessage: string): string {
    const timestamp = new Date().toISOString()
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Instagram Repost Job Error</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .error-details { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        pre { background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🚨 Instagram Repost Job Error</h2>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Subject:</strong> ${subject}</p>
        </div>

        <div class="error-details">
            <h3>Error Details</h3>
            <pre>${errorMessage}</pre>
        </div>

        <div>
            <h3>What to do next:</h3>
            <ul>
                <li>Check the Instagram repost job logs for more details</li>
                <li>Verify Instagram API credentials and permissions</li>
                <li>Check if the recipe data is valid and accessible</li>
                <li>Review the recipe_repost_queue table for failed posts</li>
            </ul>
        </div>

        <div class="footer">
            <p>This is an automated message from the Bonchef Instagram Repost Job system.</p>
            <p>If you need to disable these notifications, please contact the development team.</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  /**
   * Send email using Zoho Mail SMTP with secure TLS/SSL encryption
   */
  private async sendEmail(emailData: EmailNotificationData): Promise<void> {
    try {
      // Verify connection configuration
      await this.transporter.verify()

      // Send mail with defined transport object
      const info = await this.transporter.sendMail({
        from: `"Bonchef Instagram Job" <${this.zohoUser}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.body
      })

      console.log(`Email sent successfully to ${emailData.to} via Zoho Mail:`, info.messageId)
    } catch (error) {
      console.error('Failed to send email via Zoho Mail:', error)
      
      // Fallback: log to console if email fails
      console.log('=== EMAIL NOTIFICATION (FALLBACK) ===')
      console.log(`To: ${emailData.to}`)
      console.log(`Subject: ${emailData.subject}`)
      console.log(`Body: ${emailData.body}`)
      console.log('=====================================')
      
      throw error
    }
  }

  /**
   * Send success notification
   */
  async sendSuccessNotification(recipeTitle: string, instagramPostUrl: string): Promise<void> {
    const subject = `✅ Instagram post successful: ${recipeTitle}`
    const body = `
Successfully posted recipe "${recipeTitle}" to Instagram!

Post URL: ${instagramPostUrl}
Time: ${new Date().toISOString()}

The recipe has been successfully shared on Instagram and is now live.
    `.trim()

    await this.sendNotification(this.supportEmail, subject, body)
  }

  /**
   * Send job status summary
   */
  async sendJobSummary(processedCount: number, successCount: number, errorCount: number): Promise<void> {
    const subject = `Instagram Repost Job Summary - ${new Date().toLocaleDateString()}`
    const body = `
Instagram Repost Job completed successfully!

Summary:
- Total processed: ${processedCount}
- Successful posts: ${successCount}
- Failed posts: ${errorCount}
- Success rate: ${processedCount > 0 ? Math.round((successCount / processedCount) * 100) : 0}%

Time: ${new Date().toISOString()}
    `.trim()

    await this.sendNotification(this.supportEmail, subject, body)
  }
}
