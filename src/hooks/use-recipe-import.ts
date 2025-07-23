"use client"

import { useState } from "react"
import { z } from "zod"
import { useImportStatusStore } from "@/lib/store/import-status-store"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { startRecipeImportJob } from "@/actions/recipe-imports"
import { RecipeImportSourceTypeEnum } from "@/lib/types"
import { useOnboarding } from "@/hooks/use-onboarding"

export function useRecipeImport() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { startAnimationToCollection, finishAnimationToCollection } = useImportStatusStore()
    const { onboardingSessionId } = useOnboarding()
    const { setIsVisible } = useNavigationVisibility()

    const handleSubmit = async (
        type: z.infer<typeof RecipeImportSourceTypeEnum>,
        data: string,
        onSuccess?: () => void
    ) => {
        setError(null)
        setIsLoading(true)

        try {
            await startRecipeImportJob(type, data, onboardingSessionId ?? undefined)

            // Immediately force navigation to be visible so user sees counter badge
            setIsVisible(true)

            // Start animation
            startAnimationToCollection()

            // Reset animation after 300ms
            setTimeout(() => {
                finishAnimationToCollection()
                onSuccess?.()
                setIsLoading(false)
            }, 300) // Animation duration
        } catch (error) {
            console.error(`Failed to start recipe import job for type ${type}`, error)
            setError("Kon de server niet bereiken. Controleer je internetverbinding.")
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
