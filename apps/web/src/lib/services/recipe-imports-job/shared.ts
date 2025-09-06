import { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { RecipeImportJob, RecipeImportSourceTypeEnum, ServiceResponse } from "@/lib/types"

const MAX_VERTICAL_VIDEO_JOBS = process.env.APIFY_MAX_VERTICAL_VIDEO_JOBS
    ? parseInt(process.env.APIFY_MAX_VERTICAL_VIDEO_JOBS)
    : 7

// Create a type that excludes completed jobs
export type NonCompletedRecipeImportJob = Omit<RecipeImportJob, "status"> & {
    status: Exclude<RecipeImportJob["status"], "completed">
}

export async function listJobsWithClient(
    client: SupabaseClient,
    userId: string
): Promise<ServiceResponse<NonCompletedRecipeImportJob[]>> {
    const { data, error } = await client
        .from("recipe_import_jobs")
        .select("*")
        .eq("user_id", userId)
        .neq("status", "completed")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Failed to list recipe import jobs:", error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function createJobWithClient(
    client: SupabaseClient,
    sourceType: z.infer<typeof RecipeImportSourceTypeEnum>,
    sourceData: string,
    userId: string
): ServiceResponse<{ id: string }> {
    if (sourceType === "vertical_video") {
        const { count } = await client
            .from("recipe_import_jobs")
            .select("count", { count: "exact" })
            .eq("source_type", "vertical_video")
            .eq("status", "pending")

        if (count && count >= MAX_VERTICAL_VIDEO_JOBS) {
            console.log(`Max vertical video jobs reached, rejecting import for ${sourceData}`)
            return {
                success: false,
                error: "Er staan te veel social media imports in de wachtrij. Probeer het later nog eens.",
            }
        }
    }

    const { data, error } = await client
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

export async function getJobByRecipeIdWithClient(
    client: SupabaseClient,
    recipeId: string
): ServiceResponse<RecipeImportJob> {
    const { data, error } = await client
        .from("recipe_import_jobs")
        .select("*")
        .eq("recipe_id", recipeId)
        .single()

    if (error) {
        if (error.code === "PGRST116") {
            // No job found for this recipe (not an error in this context)
            return { success: false, error: "No job found for this recipe" }
        }
        console.error("Failed to get job ID by recipe ID:", error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function assignJobsToUserWithClient(
    client: SupabaseClient,
    jobIds: string[],
    userId: string
): ServiceResponse<null> {
    if (jobIds.length === 0) {
        return { success: true, data: null }
    }

    const { error } = await client
        .from("recipe_import_jobs")
        .update({ user_id: userId })
        .in("id", jobIds)

    if (error) {
        console.error("Failed to assign jobs to user:", error)
        return { success: false, error: error.message }
    }

    return { success: true, data: null }
}

export async function deleteRecipeImportJobWithClient(client: SupabaseClient, jobId: string) {
    const { error } = await client.from("recipe_import_jobs").delete().eq("id", jobId)

    if (error) {
        console.error("Error deleting recipe import job in shared service:", error)
        throw new Error(error.message)
    }

    return { success: true }
}
