"use client"

import { useEffect, useRef } from "react"
import { RecipeImportJob, RecipeImportSourceTypeEnum } from "@/lib/types"
import useSWR from "swr"
import { startRecipeImportJob } from "@/actions/recipe-imports"
import { z } from "zod"
import { listJobs } from "@/lib/services/recipe-imports-job/client"
import { useUser } from "@/hooks/use-user"
import { useOwnRecipes } from "./use-own-recipes"

export function useRecipeImportJobs({ enabled }: { enabled?: boolean } = { enabled: true }) {
    const { user } = useUser()
    const { mutate: mutateOwnRecipes } = useOwnRecipes()
    const previousJobsRef = useRef<RecipeImportJob[]>([])

    const { data, error, isLoading, mutate } = useSWR<RecipeImportJob[]>(
        enabled && user ? ["jobs", user.id] : null,
        async () => {
            const response = await listJobs(user!.id)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 5000,
        }
    )

    useEffect(() => {
        const currentJobs = data || []
        const previousJobs = previousJobsRef.current

        if (currentJobs.length < previousJobs.length) {
            mutateOwnRecipes()
        }

        previousJobsRef.current = currentJobs
    }, [data, mutateOwnRecipes])

    const addJob = async (
        type: z.infer<typeof RecipeImportSourceTypeEnum>,
        sourceData: string,
        onboardingSessionId?: string
    ) => {
        const optimisticJob: RecipeImportJob = {
            id: crypto.randomUUID(),
            status: "pending",
            source_type: type,
            source_data: sourceData,
            created_at: new Date().toISOString(),
            user_id: user?.id || "placeholder-user-id",
            recipe_id: null,
            error_message: null,
            updated_at: new Date().toISOString(),
        }

        mutate((currentJobs = []) => [optimisticJob, ...currentJobs], false)

        try {
            await startRecipeImportJob(type, sourceData, onboardingSessionId)
        } catch (e) {
            mutate((currentJobs = []) => {
                return currentJobs.filter((job) => job.id !== optimisticJob.id)
            }, false)
            throw e
        }
    }

    return {
        jobs: data || [],
        isLoading,
        isError: error,
        addJob,
        mutate,
    }
}
