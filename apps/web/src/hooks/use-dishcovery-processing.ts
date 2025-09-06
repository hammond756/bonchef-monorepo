import { useCallback, useState } from "react"
import { uploadDishcoveryAssets } from "@/actions/recipe-imports"

interface UseDishcoveryProcessingOptions {
    onSuccess: (description: string) => void
    onError: (error: string) => void
}

/**
 * Custom hook for handling dishcovery processing logic
 * Manages the upload and recipe generation workflow
 */
export function useDishcoveryProcessing({ onSuccess, onError }: UseDishcoveryProcessingOptions) {
    const [isProcessing, setIsProcessing] = useState(false)

    const processDishcovery = useCallback(
        async (
            photo: File,
            inputMode: "voice" | "text",
            description: string,
            audioBlobs: Blob[]
        ) => {
            try {
                setIsProcessing(true)

                // Combine all audio blobs into one
                let combinedAudioBlob: Blob | undefined
                if (inputMode === "voice" && audioBlobs.length > 0) {
                    combinedAudioBlob = new Blob(audioBlobs, { type: audioBlobs[0].type })
                }

                console.log("[useDishcoveryProcessing] Upload details:", {
                    inputMode,
                    audioBlobsCount: audioBlobs.length,
                    hasCombinedAudioBlob: !!combinedAudioBlob,
                    combinedAudioBlobSize: combinedAudioBlob?.size,
                    combinedAudioBlobType: combinedAudioBlob?.type,
                })

                const { photoUrl: uploadedPhotoUrl, audioUrl: uploadedAudioUrl } =
                    await uploadDishcoveryAssets(photo, combinedAudioBlob)

                console.log("[useDishcoveryProcessing] Upload results:", {
                    photoUrl: uploadedPhotoUrl ? "present" : "missing",
                    audioUrl: uploadedAudioUrl ? "present" : "missing",
                })

                // Start the recipe import job
                const { startRecipeImportJob } = await import("@/actions/recipe-imports")
                const dishcoveryData = JSON.stringify({
                    photoUrl: uploadedPhotoUrl,
                    description: inputMode === "voice" ? "" : description.trim(),
                    ...(inputMode === "voice" && uploadedAudioUrl
                        ? {
                              audioUrl: uploadedAudioUrl,
                          }
                        : {}),
                })

                console.log(`[useDishcoveryProcessing] Starting recipe import job for dishcovery`)

                // Start the recipe import job (this will create a DRAFT recipe)
                await startRecipeImportJob("dishcovery", dishcoveryData)

                // Reset processing state BEFORE calling onSuccess
                setIsProcessing(false)

                // Call the success callback to navigate to collection page
                onSuccess(inputMode === "voice" ? "" : description.trim() || "Alleen foto")
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
        [onSuccess, onError]
    )

    return {
        isProcessing,
        processDishcovery,
    }
}
