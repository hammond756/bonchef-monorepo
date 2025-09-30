import type { SupabaseClient } from "@supabase/supabase-js"

export interface UploadResult {
  path: string
  url: string
}

/**
 * Generates a UUID v4 string
 * @returns string - A UUID v4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Uploads an ArrayBuffer to Supabase Storage using the client
 * 
 * NOTE: This uses ArrayBuffer instead of File/Blob because React Native doesn't handle
 * File/Blob objects the same way as web browsers. According to Supabase documentation,
 * React Native requires using ArrayBuffer from base64 data for reliable uploads.
 * 
 * @param client - Supabase client instance
 * @param bucket - Storage bucket name
 * @param filePath - Path where the file should be stored
 * @param arrayBuffer - ArrayBuffer to upload
 * @param contentType - MIME type of the file
 * @returns Promise<UploadResult> - The storage path and public URL
 * @throws Error if upload fails
 */
export async function uploadArrayBufferWithClient(
  client: SupabaseClient,
  bucket: string,
  filePath: string,
  arrayBuffer: ArrayBuffer,
  contentType: string
): Promise<UploadResult> {
  console.log("Uploading ArrayBuffer to Supabase Storage", filePath)
  console.log("ArrayBuffer details:", {
    size: arrayBuffer.byteLength,
    type: contentType
  })
  
  const { data, error } = await client.storage.from(bucket).upload(filePath, arrayBuffer, {
    contentType,
    upsert: false,
  })

  console.log("Upload result:", { data, error })

  if (error) {
    console.error("Upload error details:", error)
    throw new Error(error.message)
  }

  const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath)
  if (!publicUrlData?.publicUrl) {
    throw new Error("Failed to get public URL")
  }

  console.log("Generated public URL:", publicUrlData.publicUrl)
  console.log("File path:", data.fullPath)

  return {
    path: data.fullPath,
    url: publicUrlData.publicUrl,
  }
}

/**
 * Uploads a recipe image to Supabase Storage
 * 
 * This function uses ArrayBuffer for React Native compatibility. React Native's
 * File/Blob objects don't work reliably with Supabase Storage, so we use the
 * base64 -> ArrayBuffer approach as recommended by Supabase documentation.
 * 
 * @param client - Supabase client instance
 * @param arrayBuffer - ArrayBuffer to upload
 * @param contentType - MIME type of the image
 * @returns Promise<UploadResult> - The storage path and public URL
 * @throws Error if upload fails
 */
export async function uploadRecipeImageWithClient(
  client: SupabaseClient,
  arrayBuffer: ArrayBuffer,
  contentType: string
): Promise<UploadResult> {
  // Generate unique filename with proper extension
  const fileExt = contentType.split('/')[1] || 'jpg'
  const fileName = `${generateUUID()}.${fileExt}`
  
  return await uploadArrayBufferWithClient(client, "recipe-images", fileName, arrayBuffer, contentType)
}
