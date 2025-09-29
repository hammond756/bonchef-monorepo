import { useCallback, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { pendingImportsStorage } from '@/lib/utils/mmkv/pending-imports';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { supabase } from '@/lib/utils/supabase/client';
import { API_URL } from '@/config/environment';
import { triggerJob } from '@repo/lib/services/recipe-import-jobs';

export function usePendingImports() {
  const { session, isLoading } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPendingImports = async () => {
    if (isProcessing) return;
    
    const pendingImports = pendingImportsStorage.getAll();
    if (pendingImports.length > 0) {
      setIsProcessing(true);
      
      try {
        for (const pendingImport of pendingImports) {
          try {
            await triggerJob(supabase, API_URL || '', pendingImport.type, pendingImport.data);
            pendingImportsStorage.remove(pendingImport.id);
          } catch (error) {
            console.error('Failed to process pending import:', error);
          }
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getPendingImportsCount = useCallback(function getPendingImportsCount() {
    return pendingImportsStorage.getAll().length;
  }, []);

  return {
    processPendingImports,
    getPendingImportsCount,
    isLoading,
    isProcessing
  };
}