import { ServerClient } from "postmark"
import { CommentDisplayData } from "./types"

/**
 * Email service for sending notifications via Postmark
 */
export class EmailService {

    private client: ServerClient;

    constructor(client?: ServerClient) {
        this.client = client || new ServerClient(process.env.POSTMARK_API_KEY || "")
    }

        /**
     * Sends a summary notification email with multiple comments to a recipe owner
     */
        async sendCommentSummaryNotification({
            recipientEmail,
            recipientName,
            comments,
            unsubscribeUrl,
        }: {
            recipientEmail: string;
            recipientName: string;
            comments: CommentDisplayData[];
            unsubscribeUrl: string;
        }) {
            try {
                // Ensure we use display names, never email addresses
                const displayName =
                    recipientName && !recipientName.includes("@") ? recipientName : "Chef"
    
                const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321"
    
                // Generate the comments list HTML
                const commentsList = comments.map(comment => `
                    <li style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-left: 4px solid #385940; border-radius: 4px;">
                        <div style="margin-bottom: 8px;">
                            <strong style="color: #385940;">${comment.commenterName}</strong> op 
                            <strong>"${comment.recipeTitle}"</strong>:
                        </div>
                        <div style="font-style: italic; color: #333; font-size: 14px; line-height: 1.5;">
                            "${comment.commentText}"
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${comment.recipeUrl}" 
                                style="background: #385940; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block; font-size: 16px;">
                                Bekijk reactie
                            </a>
                        </div>
                    </li>
                `).join("")
    
                const html = `
                    <!DOCTYPE html>
                    <html lang="nl">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <title>Je hebt ${comments.length} nieuwe reacties!</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
                            <tr>
                                <td align="center" style="padding: 20px 0;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <div style="text-align: center; margin-bottom: 30px;">
                                                    <img src="${supabaseHost}/storage/v1/object/public/email-assets/Logo-groen-no-text.png" 
                                                         alt="Bonchef" 
                                                         style="height: 80px; width: auto; border: 0;">
                                                </div>
                                                
                                                <h1 style="color: #385940; margin: 0 0 20px 0; font-size: 30px; font-weight: 600; text-align: center; font-family: 'Lora', serif;">
                                                    Je hebt ${comments.length} nieuwe reacties!
                                                </h1>
                                                
                                                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #333; text-align: center;">
                                                    Hoi ${displayName},
                                                </p>
    
                                                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #333; text-align: center;">
                                                    Je hebt ${comments.length} nieuwe reactie${comments.length > 1 ? 's' : ''} op je recepten:
                                                </p>
    
                                                <ul style="list-style: none; padding: 0; margin: 20px 0;">
                                                    ${commentsList}
                                                </ul>
    
                                                <hr style="margin: 40px 0; border: none; border-top: 1px solid #e9ecef;">
                                                
                                                <p style="font-size: 12px; color: #6c757d; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                                                    Geen meldingen meer ontvangen over reacties op je recepten?
                                                    <a href="${unsubscribeUrl}" style="color: #385940; text-decoration: underline;">
                                                        Klik hier om je af te melden</a>.
                                                </p>
                                                
                                                <p style="font-size: 12px; color: #6c757d; margin: 20px 0 0 0; text-align: center;">
                                                    Deze e-mail is verzonden door Bonchef. 
                                                    <a href="https://app.bonchef.io" style="color: #385940;">Bezoek onze website</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `
    
                // Generate text version
                const textComments = comments.map(comment => 
                    `* ${comment.commenterName} op "${comment.recipeTitle}": "${comment.commentText}"`
                ).join("\n")
    
                await this.client.sendEmail({
                    From: process.env.POSTMARK_FROM_EMAIL || "notifications@bonchef.io",
                    To: recipientEmail,
                    Subject: `Je hebt ${comments.length} nieuwe reacties!`,
                    HtmlBody: html,
                    TextBody: `
    Hoi ${displayName},
    
    Je hebt ${comments.length} nieuwe reactie${comments.length > 1 ? 's' : ''} op je recepten:
    
    ${textComments}
    
    Geen meldingen meer ontvangen? Klik hier: ${unsubscribeUrl}
    
    Groeten,
    Bonchef Team
                    `,
                    MessageStream: "outbound",
                    // Add headers to improve deliverability
                    Headers: [
                        {
                            Name: "List-Unsubscribe",
                            Value: `<${unsubscribeUrl}>`,
                        },
                        {
                            Name: "Precedence",
                            Value: "bulk",
                        },
                        {
                            Name: "X-Auto-Response-Suppress",
                            Value: "OOF, AutoReply",
                        },
                    ],
                })
    
                return {
                    success: true,
                    data: null,
                }
            } catch (error) {
                console.error("Failed to send summary email:", error)
                return {
                    success: false,
                    error: `Failed to send summary email: ${error instanceof Error ? error.message : "Unknown error"}`,
                }
            }
        }

    /**
     * Sends a comment notification email to a recipe owner
     */
    async sendCommentNotification({
        recipientEmail,
        recipientName,
        comment,
        unsubscribeUrl,
    }: {
        recipientEmail: string;
        recipientName: string;
        comment: CommentDisplayData;
        unsubscribeUrl: string;
    }) {
        try {
            // Ensure we use display names, never email addresses
            const displayName =
                recipientName && !recipientName.includes("@") ? recipientName : "Chef"
            const commenterDisplayName =
                comment.commenterName && !comment.commenterName.includes("@") ? comment.commenterName : "Iemand"

            const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321"

            const html = `
                <!DOCTYPE html>
                <html lang="nl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <title>Nieuwe reactie op je recept</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <img src="${supabaseHost}/storage/v1/object/public/email-assets/Logo-groen-no-text.png" 
                                                     alt="Bonchef" 
                                                     style="height: 80px; width: auto; border: 0;">
                                            </div>
                                            
                                            <h1 style="color: #385940; margin: 0 0 20px 0; font-size: 30px; font-weight: 600; text-align: center; font-family: 'Lora', serif;">
                                                Je hebt een nieuwe reactie op je recept!
                                            </h1>
                                            
                                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #333; text-align: center;">
                                                Hoi ${displayName},
                                            </p>

                                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #333; text-align: center;">
                                                <strong>${commenterDisplayName}</strong> heeft gereageerd op je recept 
                                                <strong>"${comment.recipeTitle}"</strong>:
                                            </p>

                                            <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-left: 4px solid #385940; border-radius: 4px;">
                                                <p style="font-style: italic; margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
                                                    "${comment.commentText}"
                                                </p>
                                            </div>

                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="${comment.recipeUrl}" 
                                                   style="background: #385940; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block; font-size: 16px;">
                                                    Bekijk reactie
                                                </a>
                                            </div>

                                            <hr style="margin: 40px 0; border: none; border-top: 1px solid #e9ecef;">
                                            
                                            <p style="font-size: 12px; color: #6c757d; line-height: 1.5; margin: 0 0 10px 0; text-align: center;">
                                                Geen meldingen meer ontvangen over reacties op je recepten?
                                                <a href="${unsubscribeUrl}" style="color: #385940; text-decoration: underline;">
                                                    Klik hier om je af te melden</a>.
                                            </p>
                                            
                                            <p style="font-size: 12px; color: #6c757d; margin: 20px 0 0 0; text-align: center;">
                                                Deze e-mail is verzonden door Bonchef. 
                                                <a href="https://app.bonchef.io" style="color: #385940;">Bezoek onze website</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `

            await this.client.sendEmail({
                From: process.env.POSTMARK_FROM_EMAIL || "notifications@bonchef.io",
                To: recipientEmail,
                Subject: `Je hebt een nieuwe reactie "${comment.recipeTitle}"`,
                HtmlBody: html,
                TextBody: `
Hoi ${displayName},

${commenterDisplayName} heeft gereageerd op je recept "${comment.recipeTitle}":

"${comment.commentText}"

Bekijk de reactie: ${comment.recipeUrl}

Geen meldingen meer ontvangen? Klik hier: ${unsubscribeUrl}

Groeten,
Bonchef Team
                `,
                MessageStream: "outbound",
                // Add headers to improve deliverability
                Headers: [
                    {
                        Name: "List-Unsubscribe",
                        Value: `<${unsubscribeUrl}>`,
                    },
                    {
                        Name: "Precedence",
                        Value: "bulk",
                    },
                    {
                        Name: "X-Auto-Response-Suppress",
                        Value: "OOF, AutoReply",
                    },
                ],
            })

            return {
                success: true,
                data: null,
            }
        } catch (error) {
            console.error("Failed to send email:", error)
            return {
                success: false,
                error: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    }

    /**
     * Verifies the Postmark connection
     */
    async verifyConnection() {
        try {
            // Test the connection by getting server info
            await this.client.getServer()
            return {
                success: true,
                data: null,
            }
        } catch (error) {
            console.error("Postmark connection verification failed:", error)
            return {
                success: false,
                error: `Postmark connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    }
}
