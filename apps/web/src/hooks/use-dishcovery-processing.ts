import { useCallback, useState } from "react"
import { uploadDishcoveryAudio, uploadDishcoveryImage } from "@/lib/services/storage/client"
import { useRecipeImportJobs } from "./use-recipe-import-jobs"

interface UseDishcoveryProcessingOptions {
    onSuccess: () => void
    onError: (error: string) => void
}

/**
 * Custom hook for handling dishcovery processing logic
 * Manages the upload and recipe generation workflow
 */
export function useDishcoveryProcessing({ onSuccess, onError }: UseDishcoveryProcessingOptions) {
    const [isProcessing, setIsProcessing] = useState(false)
    const { addJob } = useRecipeImportJobs()
    const processDishcovery = useCallback(
        async (
            photo: File,
            inputMode: "voice" | "text",
            description: string,
            audioFiles: File[]
        ) => {
            try {
                setIsProcessing(true)

                // Combine all audio files into one
                let combinedAudioFile: File | undefined
                if (inputMode === "voice" && audioFiles.length > 0) {
                    // Combine all audio files into a single File
                    const combinedBlob = new Blob(audioFiles, { type: audioFiles[0].type })
                    combinedAudioFile = new File(
                        [combinedBlob],
                        `combined-recording-${Date.now()}.${audioFiles[0].name.split(".").pop()}`,
                        {
                            type: audioFiles[0].type,
                            lastModified: Date.now(),
                        }
                    )
                }

                const { url: uploadedPhotoUrl } = await uploadDishcoveryImage(photo)
                const { url: uploadedAudioUrl } = combinedAudioFile
                    ? await uploadDishcoveryAudio(combinedAudioFile)
                    : { url: undefined }

                const dishcoveryData = JSON.stringify({
                    photoUrl: uploadedPhotoUrl,
                    description: description.trim(),
                    audioUrl: uploadedAudioUrl,
                })

                console.log(`[useDishcoveryProcessing] Starting recipe import job for dishcovery`)

                // Start the recipe import job (this will create a DRAFT recipe)
                await addJob("dishcovery", dishcoveryData)
                setIsProcessing(false)
                onSuccess()
            } catch (error) {
                console.error("[useDishcoveryProcessing] Failed to process:", error)

                // Provide more specific error messages based on the error type
                let errorMessage =
                    "Er ging iets mis bij het verwerken van je input. Probeer het opnieuw."

                if (error instanceof Error) {
                    if (error.message.includes("afbeeldingsformaat wordt niet ondersteund")) {
                        errorMessage = error.message
                    } else if (error.message.includes("te groot")) {
                        errorMessage = error.message
                    } else if (error.message.includes("Upload mislukt")) {
                        errorMessage = error.message
                    } else if (error.message.includes("Invalid dishcovery data")) {
                        errorMessage =
                            "De foto of beschrijving kon niet worden verwerkt. Probeer het opnieuw."
                    } else if (error.message.includes("Failed to analyze photo")) {
                        errorMessage =
                            "De foto kon niet worden geanalyseerd. Probeer een andere foto of maak een screenshot."
                    } else if (error.message.includes("unsupported image")) {
                        errorMessage =
                            "Dit afbeeldingsformaat wordt niet ondersteund door de foto-analyse. Probeer een screenshot te maken met je telefoon."
                    } else if (error.message.includes("Failed to transcribe audio")) {
                        errorMessage =
                            "De spraakopname kon niet worden verwerkt. Probeer opnieuw te spreken of gebruik tekstinvoer."
                    }
                }

                onError(errorMessage)
                setIsProcessing(false)
            }
        },
        [onSuccess, onError, addJob]
    )

    return {
        isProcessing,
        processDishcovery,
    }
}
