import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { pendingImportsStorage } from '@/lib/utils/pending-imports';
import { useRecipeImport } from '@repo/lib/hooks/use-recipe-import';
import { supabase } from '@/lib/utils/supabase/client';

export function usePendingImports() {
  const { session, isLoading } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { handleSubmit } = useRecipeImport({
    supabaseClient: supabase,
    userId: session?.user?.id || '',
  });

  const processPendingImports = async () => {
    if (isProcessing) return;
    
    const pendingImports = pendingImportsStorage.getAll();
    if (pendingImports.length > 0) {
      setIsProcessing(true);
      
      try {
        for (const pendingImport of pendingImports) {
          try {
            await handleSubmit(pendingImport.type, pendingImport.data);
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

  const getPendingImportsCount = () => {
    return pendingImportsStorage.getAll().length;
  };

  return {
    processPendingImports,
    getPendingImportsCount,
    isLoading,
    isProcessing
  };
}