"use server"

import { createAdminClient, createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function signup(email: string, password: string, displayName: string) {
    try {
        const supabase = await createClient()

        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                data: {
                    display_name: displayName,
                },
            },
        })

        if (signUpError) {
            console.error("Error signing up:", signUpError)
            return { error: signUpError.message }
        }

        if (!authData.user) {
            console.log(authData)
            return { error: "Er is iets misgegaan bij het aanmaken van je account" }
        }

        // Sign in the user automatically
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            return { error: signInError.message }
        }

        return { success: "Je account is succesvol aangemaakt" }
    } catch (error) {
        console.error("Error signing up:", error)
        return { error: "Er is iets misgegaan bij het aanmaken van je account" }
    }
}

export async function claimRecipe(recipeId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "User not authenticated" }
    }

    const marketingUserId = process.env.NEXT_PUBLIC_MARKETING_USER_ID

    if (!marketingUserId) {
        return { error: "Marketing user ID not configured" }
    }

    // First, verify the recipe belongs to the marketing user
    const { data: recipe, error: fetchError } = await supabase
        .from("recipes")
        .select("user_id")
        .eq("id", recipeId)
        .single()

    if (fetchError || !recipe) {
        console.error("Error fetching recipe:", fetchError)
        return { error: "Recipe not found" }
    }

    if (recipe.user_id !== marketingUserId) {
        console.error("Recipe does not belong to marketing user")
        return { error: "Recipe cannot be claimed" }
    }

    const supabaseAdmin = await createAdminClient()

    // Transfer ownership to the new user
    const { data: updatedRecipe, error: updateError } = await supabaseAdmin
        .from("recipes")
        .update({ user_id: user.id })
        .eq("id", recipeId)

    console.log("Updated recipe:", updatedRecipe)

    if (updateError) {
        console.error("Error transferring recipe ownership:", updateError)
        return { error: "Failed to transfer recipe ownership" }
    }

    // Revalidate the recipe page
    revalidatePath(`/recipes/${recipeId}`)

    console.log("Recipe claimed successfully", recipeId, user.id)

    return { success: "Recipe claimed successfully" }
}
