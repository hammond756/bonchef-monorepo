import { useMutation } from "@tanstack/react-query"
import type { SupabaseClient } from "@supabase/supabase-js"
import { uploadRecipeImageWithClient, type UploadResult } from "../services/storage"

/**
 * Hook for uploading recipe images
 * @param client - Supabase client instance
 * @returns Mutation object with upload functionality
 */
export function useRecipeImageUpload(client: SupabaseClient) {
  return useMutation({
    mutationFn: async ({ arrayBuffer, contentType }: { arrayBuffer: ArrayBuffer, contentType: string }): Promise<UploadResult> => {
      return await uploadRecipeImageWithClient(client, arrayBuffer, contentType)
    },
  })
}
