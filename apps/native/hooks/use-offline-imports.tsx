import { API_URL } from "@/config/environment";
import { useAuthContext } from "@/hooks/use-auth-context";
import { offlineImportsStorage } from "@/lib/utils/mmkv/offline-imports";
import { supabase } from "@/lib/utils/supabase/client";
import { useRecipeImport } from "@repo/lib/hooks/use-recipe-import";
import {
  triggerJob,
  type RecipeImportSourceType,
} from "@repo/lib/services/recipe-import-jobs";
import { useCallback, useEffect, useState } from "react";

export function useOfflineImports() {
	const { userId } = useAuthContext();
	const [isProcessing, setIsProcessing] = useState(false);
	const [offlineCount, setOfflineCount] = useState(0);

	const { createJob } = useRecipeImport({
		supabaseClient: supabase,
		userId,
		createJobFn: (sourceType: RecipeImportSourceType, sourceData: string) =>
      // We don't use the offline fallback because we'll end up in a loop.
			triggerJob(supabase, API_URL || "", sourceType, sourceData),
	});

	// Update offline count when component mounts or when processing state changes
	useEffect(() => {
		const updateCount = () => {
			const count = offlineImportsStorage.getAll().length;
			setOfflineCount(count);
		};

		// Initial count
		updateCount();

		// Set up interval to check for changes periodically
		// This is a simple approach - in a more sophisticated app you might use
		// a storage listener or event system
		const interval = setInterval(updateCount, 1000);

		return () => clearInterval(interval);
	}, []);

	const processOfflineImports = async () => {
		if (isProcessing) return;

		const offlineImports = offlineImportsStorage.getAll();
		if (offlineImports.length > 0) {
			setIsProcessing(true);

			try {
				for (const offlineImport of offlineImports) {
					try {
						await createJob(offlineImport.type, offlineImport.data);
						offlineImportsStorage.remove(offlineImport.id);
					} catch (error) {
						console.error("Failed to process offline import:", error);
					}
				}
				// Update count after processing
				setOfflineCount(offlineImportsStorage.getAll().length);
			} finally {
				setIsProcessing(false);
			}
		}
	};

	const getOfflineImportsCount = useCallback(function getOfflineImportsCount() {
		return offlineImportsStorage.getAll().length;
	}, []);

	return {
		processOfflineImports,
		getOfflineImportsCount,
		offlineCount,
		isProcessing,
	};
}
