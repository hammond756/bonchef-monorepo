import { API_URL } from "@/config/environment";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type QueryObserverResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  deleteRecipeImportJobWithClient,
  listJobsWithClient,
  type NonCompletedRecipeImportJob,
} from "../services/recipe-import-jobs";
import { useOwnRecipes } from "./use-own-recipes";

export interface UseRecipeImportOptions {
  supabaseClient: SupabaseClient;
  userId: string;
}

export interface UseRecipeImportReturn {
  isLoading: boolean;
  error: string | null;
  jobs: NonCompletedRecipeImportJob[];
  refreshJobs: () => Promise<QueryObserverResult<NonCompletedRecipeImportJob[], Error>>;
  deleteJob: (jobId: string) => Promise<void>;
  isDeleting: boolean;
}

/**
 * Hook for managing recipe imports using TanStack Query
 * @param options - Configuration options including Supabase client and user ID
 * @returns Recipe import state and functions
 */
export function useRecipeImport({ 
  supabaseClient, 
  userId 
}: UseRecipeImportOptions): UseRecipeImportReturn {
  const queryClient = useQueryClient();
  const previousJobsRef = useRef<NonCompletedRecipeImportJob[]>([]);
  const { refetch: refetchOwnRecipes } = useOwnRecipes({ supabaseClient, userId });

  // Query for fetching jobs
  const {
    data: jobs = [],
    error: queryError,
    refetch: refreshJobs,
    isLoading,
  } = useQuery({
    queryKey: ["recipe-import-jobs", userId],
    queryFn: () => listJobsWithClient(supabaseClient, userId),
    enabled: !!userId,
    refetchInterval: 2000,
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
  };
}
