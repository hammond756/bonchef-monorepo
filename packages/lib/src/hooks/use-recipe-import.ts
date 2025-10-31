import type { SupabaseClient } from "@supabase/supabase-js";
import { type QueryObserverResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  deleteRecipeImportJobWithClient,
  listJobsWithClient,
  triggerJob,
  type NonCompletedRecipeImportJob,
  type RecipeImportSourceType,
} from "../services/recipe-import-jobs";
import { useOwnRecipes } from "./use-own-recipes";

export type CreateJobFn = (
  sourceType: RecipeImportSourceType,
  sourceData: string
) => Promise<{ jobId: string }>;

export interface UseRecipeImportOptions {
  supabaseClient: SupabaseClient;
  userId: string | null;
  apiUrl: string;
}

export interface UseRecipeImportReturn {
  isLoading: boolean;
  error: string | null;
  jobs: NonCompletedRecipeImportJob[];
  refreshJobs: () => Promise<QueryObserverResult<NonCompletedRecipeImportJob[], Error>>;
  deleteJob: (jobId: string) => Promise<void>;
  isDeleting: boolean;
  createJob: (sourceType: RecipeImportSourceType, sourceData: string) => Promise<{ jobId: string }>;
  isCreating: boolean;
}

/**
 * Hook for managing recipe imports using TanStack Query
 * Implements conditional polling: polls only when there are pending jobs,
 * stops automatically when no pending jobs remain, and starts polling
 * when a new job is created.
 * ```
 * 
 * @param options - Configuration options including Supabase client, user ID, and optional createJobFn or apiUrl
 * @returns Recipe import state and functions
 */
export function useRecipeImport({ 
  supabaseClient, 
  userId,
  apiUrl,
}: UseRecipeImportOptions): UseRecipeImportReturn {
  const queryClient = useQueryClient();
  const previousJobsRef = useRef<NonCompletedRecipeImportJob[]>([]);
  const { refetch: refetchOwnRecipes } = useOwnRecipes({ supabaseClient, userId });

  // Query for fetching jobs with conditional polling
  // Polls every 2 seconds only when there are pending jobs
  const {
    data: jobs = [],
    error: queryError,
    refetch: refreshJobs,
    isLoading,
  } = useQuery({
    queryKey: ["recipe-import-jobs", userId],
    queryFn: () => listJobsWithClient(supabaseClient, userId),
    enabled: !!userId,
    refetchInterval: (query) => {
      const jobs = query.state.data as NonCompletedRecipeImportJob[] | undefined;
      console.log("jobs in refetch", jobs)
      // Check if there are any pending jobs (not failed)
      const hasPendingJobs = jobs?.some((job) => job.status === "pending") ?? false;
      // Poll every 2 seconds if there are pending jobs, stop otherwise
      return hasPendingJobs ? 2000 : false;
    },
  });

  // Mutation for creating jobs
  // When a job is created, invalidate the query to trigger an immediate refetch
  // This ensures polling starts if there weren't any pending jobs before
  const createJobMutation = useMutation({
    mutationFn: async ({ sourceType, sourceData }: { sourceType: RecipeImportSourceType; sourceData: string }) => {
      if (!apiUrl) {
        throw new Error("apiUrl is required");
      }
      return await triggerJob(supabaseClient, apiUrl, sourceType, sourceData);
    },
    onSuccess: () => {
      // Invalidate the query to trigger an immediate refetch
      // This ensures polling starts if the new job is the first pending job
      queryClient.invalidateQueries({ queryKey: ["recipe-import-jobs", userId] });
    },
  });

  // Mutation for deleting jobs
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await deleteRecipeImportJobWithClient(supabaseClient, jobId);
    },
    onMutate: async (jobId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["recipe-import-jobs", userId] });

      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData<NonCompletedRecipeImportJob[]>([
        "recipe-import-jobs",
        userId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<NonCompletedRecipeImportJob[]>(
        ["recipe-import-jobs", userId],
        (old) => old?.filter((job) => job.id !== jobId) ?? []
      );

      // Return a context object with the snapshotted value
      return { previousJobs };
    },
    onError: (_err, _jobId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJobs) {
        queryClient.setQueryData(["recipe-import-jobs", userId], context.previousJobs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["recipe-import-jobs", userId] });
    },
  });

  const createJob = async (sourceType: RecipeImportSourceType, sourceData: string) => {
    try {
      return await createJobMutation.mutateAsync({ sourceType, sourceData });
    } catch (err) {
      console.error(`Failed to create recipe import job`, err);
      throw err; // Re-throw so the UI can handle the error
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
    } catch (err) {
      console.error(`Failed to delete recipe import job ${jobId}`, err);
      throw err; // Re-throw so the UI can handle the error
    }
  };

  useEffect(() => {
    const currentJobs = jobs || []
    const previousJobs = previousJobsRef.current

    if (currentJobs.length < previousJobs.length) {
        refetchOwnRecipes()
    }

    previousJobsRef.current = currentJobs
}, [jobs, refetchOwnRecipes])

  return {
    isLoading: isLoading,
    error: queryError?.message || null,
    jobs,
    refreshJobs,
    deleteJob,
    isDeleting: deleteJobMutation.isPending,
    createJob,
    isCreating: createJobMutation.isPending,
  };
}
