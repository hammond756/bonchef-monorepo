import { SupabaseClient } from "@supabase/supabase-js";

export type RecipeImportSourceType = "url" | "image" | "text" | "vertical_video" | "dishcovery";

export interface RecipeImportJob {
  id: string;
  source_type: RecipeImportSourceType;
  source_data: string;
  user_id: string;
  status: "pending" | "completed" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

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
 * Creates a new recipe import job
 * @param client - Supabase client instance
 * @param sourceType - The type of content being imported
 * @param sourceData - The actual content data (URL, text, etc.)
 * @param userId - The user ID creating the job
 * @returns Promise<{ id: string }> - The created job ID
 * @throws Error if database error occurs or limits exceeded
 */
export async function createJobWithClient(
  client: SupabaseClient,
  sourceType: RecipeImportSourceType,
  sourceData: string,
  userId: string
): Promise<{ id: string }> {
  // Check vertical video job limits
  if (sourceType === "vertical_video") {
    const { count } = await client
      .from("recipe_import_jobs")
      .select("count", { count: "exact" })
      .eq("source_type", "vertical_video")
      .eq("status", "pending");

    if (count && count >= MAX_VERTICAL_VIDEO_JOBS) {
      console.log(`Max vertical video jobs reached, rejecting import for ${sourceData}`);
      throw new Error("Er staan te veel social media imports in de wachtrij. Probeer het later nog eens.");
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
    .single();

  if (error) {
    console.error("Failed to create recipe import job:", error);
    throw new Error(`Failed to create recipe import job: ${error.message}`);
  }

  return data;
}

/**
 * Gets a recipe import job by recipe ID
 * @param client - Supabase client instance
 * @param recipeId - The recipe ID to find the job for
 * @returns Promise<RecipeImportJob> - The job data
 * @throws Error if job not found or database error occurs
 */
export async function getJobByRecipeIdWithClient(
  client: SupabaseClient,
  recipeId: string
): Promise<RecipeImportJob> {
  const { data, error } = await client
    .from("recipe_import_jobs")
    .select("*")
    .eq("recipe_id", recipeId)
    .single();

  if (error) {
    console.error("Failed to get recipe import job:", error);
    throw new Error(`Failed to get recipe import job: ${error.message}`);
  }

  return data;
}

/**
 * Updates a recipe import job status
 * @param client - Supabase client instance
 * @param jobId - The job ID to update
 * @param status - The new status
 * @param errorMessage - Optional error message if status is failed
 * @returns Promise<void>
 * @throws Error if database error occurs
 */
export async function updateJobStatusWithClient(
  client: SupabaseClient,
  jobId: string,
  status: RecipeImportJob["status"],
  errorMessage?: string
): Promise<void> {
  const updateData: any = { status };
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await client
    .from("recipe_import_jobs")
    .update(updateData)
    .eq("id", jobId);

  if (error) {
    console.error("Failed to update recipe import job status:", error);
    throw new Error(`Failed to update recipe import job status: ${error.message}`);
  }
}
