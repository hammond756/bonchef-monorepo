import { API_URL } from "@/config/environment";
import { supabase } from "@/lib/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QueryObserverResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  deleteRecipeImportJobWithClient,
  listJobsWithClient,
  type NonCompletedRecipeImportJob,
  type RecipeImportSourceType
} from "../services/recipe-import-jobs";
import { useOwnRecipes } from "./use-own-recipes";

export interface UseRecipeImportOptions {
  supabaseClient: SupabaseClient;
  userId: string;
}

export interface UseRecipeImportReturn {
  isLoading: boolean;
  error: string | null;
  handleSubmit: (
    type: RecipeImportSourceType,
    data: string,
    onSuccess?: () => void
  ) => Promise<void>;
  jobs: NonCompletedRecipeImportJob[];
  refreshJobs: () => Promise<QueryObserverResult<NonCompletedRecipeImportJob[], Error>>;
  deleteJob: (jobId: string) => Promise<void>;
  isDeleting: boolean;
}

const triggerJob = async (type: RecipeImportSourceType, data: string): Promise<{jobId: string}> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No active session found, can't do an API request.");
  }
  console.log("Triggering job for type", type, "and data", data, "with API URL", API_URL);
  console.log("Session access token", session?.access_token);
  const response = await fetch(`${API_URL}/api/trigger-import-job`, {
    method: "POST",
    body: JSON.stringify({ sourceType: type, sourceData: data }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to trigger job");
  }
  
  return response.json();
};

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
  } = useQuery({
    queryKey: ["recipe-import-jobs", userId],
    queryFn: () => listJobsWithClient(supabaseClient, userId),
    enabled: !!userId,
    refetchInterval: 2000,
  });

  // Mutation for creating new jobs
  const createJobMutation = useMutation({
    mutationFn: async ({ type, data }: { type: RecipeImportSourceType; data: string }) => {
      const { jobId } = await triggerJob(type, data);
      console.log("Job ID from trigger job", jobId);
    },
    onSuccess: () => {
      // Invalidate and refetch jobs after successful creation
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

  const handleSubmit = async (
    type: RecipeImportSourceType,
    data: string,
    onSuccess?: () => void
  ) => {
    try {
      await createJobMutation.mutateAsync({ type, data });
      onSuccess?.();
    } catch (err) {
      console.error(`Failed to start recipe import job for type ${type}`, err);
      // Error will be available in createJobMutation.error
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
    isLoading: createJobMutation.isPending,
    error: createJobMutation.error?.message || queryError?.message || null,
    handleSubmit,
    jobs,
    refreshJobs,
    deleteJob,
    isDeleting: deleteJobMutation.isPending,
  };
}
