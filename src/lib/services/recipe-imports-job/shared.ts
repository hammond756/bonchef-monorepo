import { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { RecipeImportJob, RecipeImportSourceTypeEnum, ServiceResponse } from "@/lib/types"

export async function listJobsWithClient(
    client: SupabaseClient,
    userId: string
): Promise<ServiceResponse<RecipeImportJob[]>> {
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
