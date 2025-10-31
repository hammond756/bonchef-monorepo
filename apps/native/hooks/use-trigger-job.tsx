/* Native-specific hook to trigger a job. It wraps the triggerJob
function with a fallback to storing the job in the offline imports storage.
*/

import { useCallback } from "react";
import { triggerJob, type RecipeImportSourceType } from "@repo/lib/services/recipe-import-jobs";
import { offlineImportsStorage } from "@/lib/utils/mmkv/offline-imports";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeError } from "@repo/lib/utils/error-handling";
import type { CreateJobFn } from "@repo/lib/hooks/use-recipe-import";

/**
 * Creates a job creation function with offline fallback.
 * This can be passed to useRecipeImport's createJobFn option to enable
 * offline storage when job creation fails due to auth/network issues.
 */
export function useTriggerJob({ supabaseClient, apiUrl }: { supabaseClient: SupabaseClient, apiUrl: string }) {

  /* 
  Triggers a job and stores it in the offline imports storage if the request fails.
  Compatible with useRecipeImport's CreateJobFn type.
  Returns a placeholder jobId when storing offline (job will be processed later).
  */
  const triggerJobWithOfflineFallback = useCallback<CreateJobFn>(async (sourceType: RecipeImportSourceType, sourceData: string) => {
    try {
      return await triggerJob(supabaseClient, apiUrl, sourceType, sourceData);
    } catch (originalError) {
      const error = normalizeError(originalError);

      // TODO: Expand to network errors
      if (error.kind === 'auth' || (error.kind === 'server' && error.status === 401)) {
        offlineImportsStorage.add({ type: sourceType, data: sourceData });
        // Return placeholder jobId for offline storage
        // The actual job will be created later when processOfflineImports runs
        return { jobId: `offline-${Date.now()}` };
      } else {
        console.error("Failed to trigger job", error);
        throw error;
      }
    }
  }, [supabaseClient, apiUrl]);

  return { triggerJobWithOfflineFallback };
}