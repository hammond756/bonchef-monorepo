import { SupabaseClient } from "@supabase/supabase-js"
import { ServiceResponse, RecipeImportSourceTypeEnum } from "@/lib/types"
import { z } from "zod"

export class RecipeImportJobService {
    private supabase: SupabaseClient

    constructor(supabaseClient: SupabaseClient) {
        this.supabase = supabaseClient
    }

    /**
     * Creates a new recipe import job.
     * @param sourceType The type of the import source (url, image, text).
     * @param sourceData The data for the import (URL, image URL, or raw text).
     * @param userId The ID of the user creating the job.
     * @returns A service response with the ID of the created job.
     */
    async createJob(
        sourceType: z.infer<typeof RecipeImportSourceTypeEnum>,
        sourceData: string,
        userId: string
    ): ServiceResponse<{ id: string }> {
        const { data, error } = await this.supabase
            .from("recipe_import_jobs")
            .insert({
                source_type: sourceType,
                source_data: sourceData,
                user_id: userId,
                status: "pending",
            })
            .select("id")
            .single()

        if (error) {
            console.error("Failed to create recipe import job:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    }

    /**
     * Updates the user ID for a list of recipe import jobs.
     * @param jobIds The IDs of the jobs to update.
     * @param userId The ID of the new user to associate the jobs with.
     * @returns A service response indicating success or failure.
     */
    async assignJobsToUser(jobIds: string[], userId: string): ServiceResponse<null> {
        if (jobIds.length === 0) {
            return { success: true, data: null }
        }

        const { error } = await this.supabase
            .from("recipe_import_jobs")
            .update({ user_id: userId })
            .in("id", jobIds)

        if (error) {
            console.error("Failed to assign jobs to user:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data: null }
    }
}
