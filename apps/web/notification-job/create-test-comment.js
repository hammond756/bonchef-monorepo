#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: '.env.local' })

async function createTestComment() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    try {
        // Get first recipe
        const { data: recipes, error: recipeError } = await supabase
            .from("recipes")
            .select("id, title, user_id")
            .limit(1)

        if (recipeError || !recipes || recipes.length === 0) {
            console.error("No recipes found")
            return
        }

        const recipe = recipes[0]
        console.log("Found recipe:", recipe.title)

        // Get a different user to comment (not the recipe owner)
        const { data: users, error: userError } = await supabase
            .from("profiles")
            .select("id, display_name")
            .neq("id", recipe.user_id)
            .limit(1)

        if (userError || !users || users.length === 0) {
            console.error("No other users found")
            return
        }

        const commenter = users[0]
        console.log("Commenter:", commenter.display_name)

        // Create a comment
        const { data: comment, error: commentError } = await supabase
            .from("comments")
            .insert({
                recipe_id: recipe.id,
                user_id: commenter.id,
                text: "Dit is een test comment om het notification systeem te testen! 🧪"
            })
            .select()
            .single()

        if (commentError) {
            console.error("Failed to create comment:", commentError)
            return
        }

        console.log("✅ Comment created:", comment.id)
        console.log("📧 This should trigger a notification to:", recipe.user_id)

        // Check if notification was created
        const { data: notifications, error: notifError } = await supabase
            .from("notification_queue")
            .select("*")
            .eq("comment_id", comment.id)

        if (notifError) {
            console.error("Failed to check notifications:", notifError)
            return
        }

        if (notifications && notifications.length > 0) {
            console.log("✅ Notification created in queue!")
            console.log("📊 Pending notifications:", notifications.length)
        } else {
            console.log("❌ No notification created")
        }

    } catch (error) {
        console.error("Error:", error)
    }
}

createTestComment() 