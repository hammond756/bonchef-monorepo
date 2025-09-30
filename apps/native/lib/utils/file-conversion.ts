/**
 * Validates and normalizes MIME type for Supabase bucket restrictions
 * @param mimeType - The detected MIME type
 * @returns string - A valid MIME type for the bucket
 */
function validateMimeType(mimeType: string | undefined): string {
  const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/avif"]
  
  // If no type provided, default to jpeg
  if (!mimeType) {
    console.warn('No MIME type provided, defaulting to image/jpeg')
    return 'image/jpeg'
  }
  
  // If not in allowed types, default to jpeg for bucket compatibility
  if (!allowedMimeTypes.includes(mimeType)) {
    console.warn(`MIME type ${mimeType} not allowed, defaulting to image/jpeg`)
    return 'image/jpeg'
  }
  
  return mimeType
}

/**
 * Converts a React Native ImagePicker result to ArrayBuffer for Supabase upload
 * @param uri - The local URI from ImagePicker
 * @param base64 - The base64 string from ImagePicker
 * @param type - MIME type of the image
 * @returns Promise<{arrayBuffer: ArrayBuffer, contentType: string}> - ArrayBuffer and content type for upload
 */
export async function createArrayBufferFromImagePicker(
  uri: string, 
  base64: string | undefined, 
  type: string = 'image/jpeg'
): Promise<{arrayBuffer: ArrayBuffer, contentType: string}> {
  
  // Validate and normalize the MIME type for bucket restrictions
  const contentType = validateMimeType(type)
  
  let arrayBuffer: ArrayBuffer
  
  if (base64) {
    // Use the base64 data directly (recommended approach for React Native)
    const { decode } = await import('base64-arraybuffer')
    arrayBuffer = decode(base64)
  } else {
    // Fallback: fetch the URI and convert to ArrayBuffer
    console.log('No base64 data, fetching URI as fallback')
    const response = await fetch(uri)
    const blob = await response.blob()
    arrayBuffer = await blob.arrayBuffer()
  }
  
  return { arrayBuffer, contentType }
}

