import type { SupabaseClient } from "@supabase/supabase-js";

export type RecipeImportSourceType = "url" | "image" | "text" | "vertical_video" | "dishcovery";

export interface NonCompletedRecipeImportJob {
  id: string;
  source_type: RecipeImportSourceType;
  source_data: string;
  user_id: string;
  status: "pending" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Constants
const MAX_VERTICAL_VIDEO_JOBS = 5;

/**
 * Lists all non-completed recipe import jobs for a user
 * @param client - Supabase client instance
 * @param userId - The user ID to fetch jobs for
 * @returns Promise<NonCompletedRecipeImportJob[]> - List of jobs
 * @throws Error if database error occurs
 */
export async function listJobsWithClient(
  client: SupabaseClient,
  userId: string
): Promise<NonCompletedRecipeImportJob[]> {
  const { data, error } = await client
    .from("recipe_import_jobs")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list recipe import jobs:", error);
    throw new Error(`Failed to list recipe import jobs: ${error.message}`);
  }

  return data || [];
}

/**
 * Deletes a recipe import job by ID
 * @param client - Supabase client instance
 * @param jobId - The job ID to delete
 * @returns Promise<void>
 * @throws Error if database error occurs
 */
export async function deleteRecipeImportJobWithClient(
  client: SupabaseClient,
  jobId: string
): Promise<void> {
  const { error } = await client
    .from("recipe_import_jobs")
    .delete()
    .eq("id", jobId);

  if (error) {
    console.error("Failed to delete recipe import job:", error);
    throw new Error(`Failed to delete recipe import job: ${error.message}`);
  }
}
