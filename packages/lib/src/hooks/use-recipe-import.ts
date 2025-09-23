import { API_URL } from "@/config/environment";
import { supabase } from "@/lib/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
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
  refreshJobs: () => Promise<any>;
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
    refreshJobs: () => refreshJobs(),
  };
}
