import { createAdminClient } from "@/utils/supabase/server"

/**
 * Service for handling user unsubscribe operations
 */
export class UnsubscribeService {
    /**
     * Unsubscribes a user from email notifications
     */
    static async unsubscribeUser(userId: string, notificationType: string) {
        try {
            const supabase = await createAdminClient()

            // Validate the user ID
            if (!userId || typeof userId !== "string") {
                return { success: false, error: "Invalid user ID" }
            }

            // Validate notification type
            if (notificationType !== "recipe_comment") {
                return { success: false, error: "Invalid notification type" }
            }

            // Update notification preferences
            const { error } = await supabase
                .from("notification_preferences")
                .update({ 
                    recipe_comment_notifications: false,
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", userId)

            if (error) {
                console.error("Failed to update notification preferences:", error)
                return { success: false, error: "Failed to update preferences" }
            }

            // Track unsubscribe event (PostHog tracking can be added here)
            try {
                const { data: user } = await supabase.auth.admin.getUserById(userId)
                if (user.user?.email) {
                    console.log(`User ${user.user.email} unsubscribed from ${notificationType} notifications`)
                }
            } catch (error) {
                console.error("Failed to track unsubscribe event:", error)
            }

            return { success: true }
        } catch (error) {
            console.error("Error in unsubscribeUser:", error)
            return { success: false, error: "Internal server error" }
        }
    }

    /**
     * Validates unsubscribe parameters from URL
     */
    static validateUnsubscribeParams(userId: string | null, type: string | null) {
        if (!userId || !type) {
            return { valid: false, error: "Missing required parameters: user_id (u) and type (t)" }
        }

        if (type !== "recipe_comment") {
            return { valid: false, error: "Invalid notification type. Only 'recipe_comment' is supported." }
        }

        return { valid: true }
    }
} 