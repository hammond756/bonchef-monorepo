import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { EmailService } from "./email-service.js"
import { CommentData, UnsentNotification } from "./types.js"


const getUnsentNotifications = async (supabase: SupabaseClient) => {
    const { data, error: fetchError } = await supabase
    .from("notification_queue")
    .select(`
        id, comment_id, recipe_id, recipient_id,
        profiles ( display_name, notification_preferences ( recipe_comment_notifications ) )
        `)
    .eq("sent", false)
    .order("created_at", { ascending: false })
    
    // This is due to type mismatch between supabase client types and the actual data
    const notifications = (data ?? []) as unknown as UnsentNotification[]

    if (fetchError) {
        const message = `Failed to fetch unsent notifications: ${fetchError.message}`
        console.error(message)
        throw new Error(message)
    }

    return notifications.filter(
        notification => notification.profiles.notification_preferences.recipe_comment_notifications
    )
}


/**
 * Background worker for processing email notifications
 */
export class NotificationWorker {
    private supabase: SupabaseClient;
    private emailService: EmailService;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY || ""
        )
        this.emailService = new EmailService()
    }

    /**
     * Processes pending notifications and sends emails
     */
    async processNotifications() {
        try {
            console.log("Starting notification processing...")

            const notifications = await getUnsentNotifications(this.supabase)

            if (!notifications || notifications.length === 0) {
                console.log("No pending notifications found")
                return {
                    success: true,
                    data: { processed: 0, sent: 0, errors: 0 },
                }
            }

            console.log(`Processing ${notifications.length} notifications...`)

            // Group notifications by recipient
            const notificationsByRecipient = this.groupNotificationsByRecipient(notifications)

            let sentCount = 0
            let errorCount = 0

            // Process each recipient's notifications
            for (const [recipientId, recipientNotifications] of notificationsByRecipient) {
                const result = await this.processRecipientNotifications(recipientId, recipientNotifications)
                if (result.success) {
                    sentCount++
                } else {
                    errorCount++
                    console.error(
                        `Failed to process notifications for recipient ${recipientId}:`,
                        result.error
                    )
                }
            }

            console.log(
                `Processed ${notifications.length} notifications for ${notificationsByRecipient.size} recipients: ${sentCount} sent, ${errorCount} errors`
            )

            return {
                success: true,
                data: { processed: notifications.length, sent: sentCount, errors: errorCount },
            }
        } catch (error) {
            console.error("Unexpected error in notification processing:", error)
            return {
                success: false,
                error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    }

    /**
     * Groups notifications by recipient ID
     */
    groupNotificationsByRecipient(notifications: UnsentNotification[]) {
        const grouped = new Map()
        
        for (const notification of notifications) {
            const recipientId = notification.recipient_id
            if (!grouped.has(recipientId)) {
                grouped.set(recipientId, [])
            }
            grouped.get(recipientId).push(notification)
        }
        
        return grouped
    }

    /**
     * Processes all notifications for a single recipient
     */
    async processRecipientNotifications(recipientId: string, notifications: UnsentNotification[]) {
        try {

            // Get recipient email from auth.users
            const { data: user, error: userError } = await this.supabase.auth.admin.getUserById(recipientId)

            if (userError || !user.user?.email) {
                console.error(
                    `Failed to fetch user email for ${recipientId}:`,
                    userError
                )
                return {
                    success: false,
                    error: `Failed to fetch user email: ${userError?.message || "Email not found"}`,
                }
            }

            // Collect all comment data for this recipient
            const comments = await this.getCommentData(notifications)

            if (comments.length === 0) {
                console.log(`No valid comments found for recipient ${recipientId}`)
                return {
                    success: false,
                    error: "No valid comments found",
                }
            }

            // Determine base URL based on environment
            const baseUrl =
                process.env.NODE_ENV === "development"
                    ? "http://localhost:3000"
                    : "https://app.bonchef.io"

            let emailResult;

            const commentDisplayData = comments.map(c => ({
                commenterName: c.profiles.display_name,
                recipeTitle: c.recipes.title,
                recipeUrl: `${baseUrl}/recipes/${c.recipe_id}`,
                commentText: c.text,
            }))

            if (comments.length === 1) {
                // Send single comment email
                emailResult = await this.emailService.sendCommentNotification({
                    recipientEmail: user.user.email,
                    recipientName: notifications[0].profiles.display_name,
                    comment: commentDisplayData[0],
                    unsubscribeUrl: `${baseUrl}/unsubscribe?u=${recipientId}&t=recipe_comment`,
                })
            } else {
                // Send summary email
                emailResult = await this.emailService.sendCommentSummaryNotification({
                    recipientEmail: user.user.email,
                    recipientName: notifications[0].profiles.display_name,
                    comments: commentDisplayData,
                    unsubscribeUrl: `${baseUrl}/unsubscribe?u=${recipientId}&t=recipe_comment`,
                })
            }


            if (!emailResult.success) {
                return emailResult
            }

            // Mark all notifications as sent
            await this.markNotificationsAsSent(notifications.map(n => n.id))

            console.log(`Successfully sent summary notification for ${comments.length} comments to ${user.user.email}`)

            return { success: true, data: null }
        } catch (error) {
            console.error(`Error processing notifications for recipient ${recipientId}:`, error)
            return {
                success: false,
                error: `Processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    }

    /**
     * Gets comment data for a notification
     */
    async getCommentData(notifications: UnsentNotification[]) {
        // Get comment details
        const { data, error: commentError } = await this.supabase
            .from("comments")
            .select("text, user_id, recipe_id, profiles(display_name), recipes(title)")
            .in("id", notifications.map(n => n.comment_id))

        const comments = (data ?? []) as unknown as CommentData[]

        if (commentError || !comments) {
            console.error(`Failed to fetch comments:`, commentError)
            throw new Error(`Failed to fetch comments: ${commentError?.message || "Comments not found"}`)
        }

        // Determine base URL based on environment
        const baseUrl =
            process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : "https://app.bonchef.io"

        const commentData = comments.map(c => ({
            commenterName: c.profiles.display_name,
            recipeTitle: c.recipes.title,
            recipeUrl: `${baseUrl}/recipes/${c.recipe_id}`,
            commentText: c.text,
        }))

        return comments
    }

    /**
     * Marks multiple notifications as sent
     */
    async markNotificationsAsSent(notificationIds: string[]) {
        try {
            await this.supabase
                .from("notification_queue")
                .update({ sent: true })
                .in("id", notificationIds)
        } catch (error) {
            console.error(`Failed to mark notifications as sent:`, error)
        }
    }

    /**
     * Verifies the worker can connect to all required services
     */
    async verifyConnections() {
        try {
            // Test Supabase connection
            const { error: supabaseError } = await this.supabase
                .from("notification_queue")
                .select("id")
                .limit(1)
            if (supabaseError) {
                return {
                    success: false,
                    error: `Supabase connection failed: ${supabaseError.message}`,
                }
            }

            // Test email connection
            const emailResult = await this.emailService.verifyConnection()
            if (!emailResult.success) {
                return emailResult
            }

            return { success: true, data: null }
        } catch (error) {
            return {
                success: false,
                error: `Connection verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
        }
    }
}
