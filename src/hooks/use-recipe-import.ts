"use client"

import { useState } from "react"
import { z } from "zod"
import { useImportStatusStore } from "@/lib/store/import-status-store"
import { startRecipeImportJob } from "@/actions/recipe-imports"
import { RecipeImportSourceTypeEnum } from "@/lib/types"

interface UseRecipeImportProps {
    onClose: () => void
}

export function useRecipeImport({ onClose }: UseRecipeImportProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { startAnimationToCollection, finishAnimationToCollection } = useImportStatusStore()

    const handleSubmit = async (type: z.infer<typeof RecipeImportSourceTypeEnum>, data: string) => {
        setError(null)
        setIsLoading(true)

        try {
            await startRecipeImportJob(type, data)

            // Start animation first
            startAnimationToCollection()

            // Update badge and close modal after animation completes
            setTimeout(() => {
                finishAnimationToCollection()
                onClose()
            }, 300) // Animation duration
        } catch (error) {
            console.error(`Failed to start recipe import job for type ${type}`, error)
            setError("Kon de server niet bereiken. Controleer je internetverbinding.")
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        setError,
        handleSubmit,
    }
}
