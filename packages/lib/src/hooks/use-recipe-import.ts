import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  RecipeImportSourceType, 
  createJobWithClient, 
  listJobsWithClient,
  NonCompletedRecipeImportJob 
} from "../services/recipe-import-jobs";

export interface UseRecipeImportOptions {
  supabaseClient: SupabaseClient;
  userId: string;
}

export interface UseRecipeImportReturn {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  handleSubmit: (
    type: RecipeImportSourceType,
    data: string,
    onSuccess?: () => void
  ) => Promise<void>;
  jobs: NonCompletedRecipeImportJob[];
  refreshJobs: () => Promise<any>;
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

  // Query for fetching jobs
  const {
    data: jobs = [],
    error: queryError,
    refetch: refreshJobs,
  } = useQuery({
    queryKey: ["recipe-import-jobs", userId],
    queryFn: () => listJobsWithClient(supabaseClient, userId),
    enabled: !!userId,
  });

  // Mutation for creating new jobs
  const createJobMutation = useMutation({
    mutationFn: ({ type, data }: { type: RecipeImportSourceType; data: string }) =>
      createJobWithClient(supabaseClient, type, data, userId),
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

  return {
    isLoading: createJobMutation.isPending,
    error: createJobMutation.error?.message || queryError?.message || null,
    setError: () => {}, // Not needed with TanStack Query
    handleSubmit,
    jobs,
    refreshJobs: () => refreshJobs(),
  };
}
