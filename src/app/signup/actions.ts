"use server"

import { cookies } from "next/headers"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { OnboardingService } from "@/lib/services/onboarding-service"
import { RecipeService } from "@/lib/services/recipe-service"
import { revalidatePath } from "next/cache"
import { assignJobsToUserWithClient } from "@/lib/services/recipe-imports-job/shared"

export async function associateOnboardingData(userId: string) {
    const cookieStore = await cookies()
    const onboardingSessionId = cookieStore.get("onboarding_session_id")?.value

    if (!onboardingSessionId) {
        return { success: true }
    }

    console.log(
        `Found onboarding session ${onboardingSessionId} for new user ${userId}. Associating data...`
    )

    const supabaseAdmin = await createAdminClient()
    const onboardingService = new OnboardingService(supabaseAdmin)
    const recipeService = new RecipeService(supabaseAdmin)

    // 1. Get all associated data
    const associationsResponse =
        await onboardingService.getAssociationsForSession(onboardingSessionId)

    if (!associationsResponse.success) {
        console.error("Error fetching onboarding associations:", associationsResponse.error)
        return { success: false }
    }

    const { recipeIds, jobIds } = associationsResponse.data

    const recipeAssignResponse = await recipeService.assignRecipesToUser(recipeIds, userId)

    if (!recipeAssignResponse.success) {
        console.error("Error assigning recipes to user:", recipeAssignResponse.error)
        return { success: false }
    }

    const jobAssignResponse = await assignJobsToUserWithClient(supabaseAdmin, jobIds, userId)

    if (!jobAssignResponse.success) {
        console.error("Error assigning jobs to user:", jobAssignResponse.error)
        return { success: false }
    }

    // 3. Clean up associations
    await onboardingService.deleteAssociationsForSession(onboardingSessionId)

    // 4. Clear the cookie
    cookieStore.delete("onboarding_session_id")

    console.log(`Successfully associated data for user ${userId}.`)

    return { success: true }
}

export async function signup(email: string, password: string, displayName: string) {
    const supabase = await createClient()

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-callback`,
            data: {
                display_name: displayName,
            },
        },
    })

    if (signUpError) {
        console.error("Error signing up:", signUpError)
        return { error: signUpError.message }
    }

    const user = authData.user
    if (!user) {
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
}

export async function claimRecipe(recipeId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "User not authenticated" }
    }

    const marketingUserId = process.env.NEXT_PUBLIC_MARKETING_USER_ID

    if (!marketingUserId) {
        return { success: false, error: "Marketing user ID not configured" }
    }

    // First, verify the recipe belongs to the marketing user
    const { data: recipe, error: fetchError } = await supabase
        .from("recipes")
        .select("user_id")
        .eq("id", recipeId)
        .single()

    if (fetchError || !recipe) {
        console.error("Error fetching recipe:", fetchError)
        return { success: false, error: "Recipe not found" }
    }

    if (recipe.user_id !== marketingUserId) {
        console.error("Recipe does not belong to marketing user")
        return {
            success: false,
            error: `Recipe cannot be claimed, ${recipe.user_id} !== ${marketingUserId}`,
        }
    }

    const supabaseAdmin = await createAdminClient()

    // Transfer ownership to the new user
    const { data: updatedRecipe, error: updateError } = await supabaseAdmin
        .from("recipes")
        .update({ user_id: user.id })
        .eq("id", recipeId)
        .select("*")

    console.log("Updated recipe:", updatedRecipe)

    if (updateError) {
        console.error("Error transferring recipe ownership:", updateError)
        return { success: false, error: "Failed to transfer recipe ownership" }
    }

    // Revalidate the recipe page
    revalidatePath(`/recipes/${recipeId}`)

    console.log("Recipe claimed successfully", recipeId, user.id)

    return { success: true, error: null }
}
