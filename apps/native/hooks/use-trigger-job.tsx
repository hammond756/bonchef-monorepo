/* Native-specific hook to trigger a job. It wraps the triggerJob
function with a fallback to storing the job in the offline imports storage.
*/

import { useCallback } from "react";
import { RecipeImportSourceType, triggerJob } from "@repo/lib/services/recipe-import-jobs";
import { offlineImportsStorage } from "@/lib/utils/mmkv/offline-imports";
import { SupabaseClient } from "@supabase/supabase-js";
import { normalizeError } from "@repo/lib/utils/error-handling";

export function useTriggerJob({ supabaseClient, apiUrl }: { supabaseClient: SupabaseClient, apiUrl: string }) {

  /* 
  Triggers a job and stores it in the offline imports storage if the request fails.
  */
  const triggerJobWithOfflineFallback = useCallback(async (sourceType: RecipeImportSourceType, sourceData: string) => {
    try {
      return await triggerJob(supabaseClient, apiUrl, sourceType, sourceData);
    } catch (originalError) {
      const error = normalizeError(originalError);

      // TODO: Expand to network errors
      if (error.kind === 'auth' || (error.kind === 'server' && error.status === 401)) {
        offlineImportsStorage.add({ type: sourceType, data: sourceData });
      } else {
        console.error("Failed to trigger job", error);
        throw error;
      }
    }
  }, [supabaseClient, apiUrl]);

  return { triggerJobWithOfflineFallback };
}