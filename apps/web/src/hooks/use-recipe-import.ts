"use client"

import { useState } from "react"
import { z } from "zod"
import { useImportStatusStore } from "@/lib/store/import-status-store"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { RecipeImportSourceTypeEnum } from "@/lib/types"
import { useRecipeImportJobs } from "./use-recipe-import-jobs"

export function useRecipeImport() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { startAnimationToCollection, finishAnimationToCollection } = useImportStatusStore()
    const { setIsVisible } = useNavigationVisibility()
    const { addJob } = useRecipeImportJobs()

    const handleSubmit = async (
        type: z.infer<typeof RecipeImportSourceTypeEnum>,
        data: string,
        onSuccess?: () => void
    ) => {
        setError(null)
        setIsLoading(true)

        try {
            await addJob(type, data)

            setIsVisible(true)
            startAnimationToCollection()

            setTimeout(() => {
                finishAnimationToCollection()
                onSuccess?.()
                setIsLoading(false)
            }, 300)
        } catch (error) {
            console.error(`Failed to start recipe import job for type ${type}`, error)
            setError(
                error instanceof Error
                    ? error.message
                    : "Er ging iets mis bij het importeren van het recept. Het is helaas niet duidelijk wat de oorzaak is."
            )
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
