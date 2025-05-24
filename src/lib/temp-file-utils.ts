import fs from "fs";
import { hostedImageToBuffer } from "@/lib/utils";

/**
 * Creates a temporary file from a hosted image URL and manages its lifecycle.
 * Similar to Python's context manager pattern.
 * @param imageUrl The URL of the image to download
 * @param callback The function to execute with the temporary file path
 * @returns The result of the callback function
 */
export async function withTempFileFromUrl<T>(
  imageUrl: string,
  callback: (tempFilePath: string) => Promise<T>
): Promise<T> {
  const { data, extension } = await hostedImageToBuffer(imageUrl);
  const tempFileName = `temp-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
  
  try {
    // Write buffer to temporary file
    await fs.promises.writeFile(tempFileName, data);
    
    // Execute the callback with the temporary file path
    return await callback(tempFileName);
  } finally {
    // Always clean up the temporary file, even if callback throws
    try {
      await fs.promises.unlink(tempFileName);
    } catch (unlinkError) {
      console.warn(`Failed to delete temporary file ${tempFileName}:`, unlinkError);
    }
  }
}
