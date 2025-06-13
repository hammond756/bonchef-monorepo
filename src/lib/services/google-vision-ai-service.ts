import { ImageAnnotatorClient } from "@google-cloud/vision"

const client = new ImageAnnotatorClient()

/**
 * Extracts all visible text from an image file.
 * @param filePath The local path to the image file.
 * @returns A promise that resolves with the extracted text, or an empty string if no text is found.
 */
export async function detectText(filePath: string): Promise<string> {
    try {
        const [result] = await client.textDetection({
            image: {
                source: {
                    filename: filePath,
                },
            },
        })

        const { textAnnotations, error } = result

        if (error) {
            console.error("error", error)
            throw new Error("Failed to detect text from image")
        }

        if (textAnnotations && textAnnotations.length > 0) {
            // The first element in textAnnotations is usually the full text detected
            const fullText = textAnnotations[0].description
            return fullText || ""
        } else {
            console.log("No text detected in the image.")
            return ""
        }
    } catch (error) {
        console.error("Error detecting text:", error)
        throw error
    }
}
