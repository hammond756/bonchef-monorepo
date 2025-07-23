import { SupabaseClient } from "@supabase/supabase-js"
import { ServiceResponse } from "@/lib/types"

export class OnboardingService {
    private supabase: SupabaseClient

    constructor(supabaseClient: SupabaseClient) {
        this.supabase = supabaseClient
    }

    /**
     * Creates an association between an onboarding session and a recipe import job.
     * @param onboardingSessionId The ID of the onboarding session.
     * @param jobId The ID of the recipe import job.
     * @returns A service response indicating success or failure.
     */
    async createJobAssociation(onboardingSessionId: string, jobId: string): ServiceResponse<null> {
        const { error } = await this.supabase.from("onboarding_associations").insert({
            onboarding_session_id: onboardingSessionId,
            job_id: jobId,
        })

        if (error) {
            console.error("Failed to create job association:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data: null }
    }

    /**
     * Creates an association between an onboarding session and a created recipe.
     * @param onboardingSessionId The ID of the onboarding session.
     * @param recipeId The ID of the recipe.
     * @returns A service response indicating success or failure.
     */
    async createRecipeAssociation(
        onboardingSessionId: string,
        recipeId: string
    ): ServiceResponse<null> {
        const { error } = await this.supabase.from("onboarding_associations").insert({
            onboarding_session_id: onboardingSessionId,
            recipe_id: recipeId,
        })

        if (error) {
            console.error("Failed to create recipe association:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data: null }
    }

    /**
     * Retrieves all associations for a given onboarding session.
     * @param onboardingSessionId The ID of the onboarding session.
     * @returns A service response with the list of associations.
     */
    async getAssociationsForSession(
        onboardingSessionId: string
    ): ServiceResponse<{ recipeIds: string[]; jobIds: string[] }> {
        const { data, error } = await this.supabase
            .from("onboarding_associations")
            .select("recipe_id, job_id")
            .eq("onboarding_session_id", onboardingSessionId)

        if (error) {
            console.error("Failed to get associations for session:", error)
            return { success: false, error: error.message }
        }

        return {
            success: true,
            data: {
                recipeIds: data.map((a) => a.recipe_id).filter(Boolean) as string[],
                jobIds: data.map((a) => a.job_id).filter(Boolean) as string[],
            },
        }
    }

    /**
     * Deletes all associations for a given onboarding session.
     * @param onboardingSessionId The ID of the onboarding session.
     * @returns A service response indicating success or failure.
     */
    async deleteAssociationsForSession(onboardingSessionId: string): ServiceResponse<null> {
        const { error } = await this.supabase
            .from("onboarding_associations")
            .delete()
            .eq("onboarding_session_id", onboardingSessionId)

        if (error) {
            console.error("Failed to delete associations for session:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data: null }
    }
}
