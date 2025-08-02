import { createClient } from "@/utils/supabase/server"
import { v4 as uuidv4 } from "uuid"

// Bucket name for storing recipe images
const RECIPE_IMAGES_BUCKET = "recipe-images"

/**
 * Upload an image to Supabase Storage from a base64 string (server-side)
 * @param base64Image - The base64 image string
 * @param fileName - Optional file name, defaults to a UUID
 * @returns The public URL of the uploaded image
 */
export async function uploadImageFromBase64Server(
    base64Image: string,
    fileName?: string
): Promise<string> {
    const supabase = await createClient()

    // Validate the base64 string
    if (!base64Image.startsWith("data:image/")) {
        throw new Error("Invalid image format. Must be a base64 image string.")
    }

    // Extract content type and base64 data
    const [meta, data] = base64Image.split(",")
    const contentType = meta.split(":")[1].split(";")[0]
    const fileExt = contentType.split("/")[1]

    // Generate file name if not provided
    const finalFileName = fileName || `${uuidv4()}.${fileExt}`

    // In Node.js environment (server-side)
    const buffer = Buffer.from(data, "base64")

    // Upload to Supabase storage
    const { error } = await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .upload(`${finalFileName}`, buffer, {
            contentType,
        })

    if (error) {
        console.error("Error uploading image:", error)
        throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .getPublicUrl(`${finalFileName}`)

    return publicUrlData.publicUrl
}

/**
 * Convert a URL to base64 (needed for external images)
 * @param url - The URL of the image to convert
 * @returns A base64 encoded string of the image
 */
export async function imageUrlToBase64Server(url: string): Promise<string> {
    try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64String = buffer.toString("base64")
        const contentType = response.headers.get("content-type") || "image/jpeg"
        return `data:${contentType};base64,${base64String}`
    } catch (error) {
        console.error("Error converting image to base64:", error)
        throw error
    }
}
