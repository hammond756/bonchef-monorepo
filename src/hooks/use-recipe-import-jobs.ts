"use client"

import { useEffect, useRef } from "react"
import { RecipeImportJob, RecipeImportSourceTypeEnum } from "@/lib/types"
import useSWR from "swr"
import { startRecipeImportJob } from "@/actions/recipe-imports"
import { z } from "zod"
import { listJobs } from "@/lib/services/recipe-imports-job/client"
import { useSession } from "@/hooks/use-session"
import { useOwnRecipes } from "./use-own-recipes"
import { trackEvent } from "@/lib/analytics/track"

export function useRecipeImportJobs() {
    const { session } = useSession()
    const { mutate: mutateOwnRecipes } = useOwnRecipes()
    const previousJobsRef = useRef<RecipeImportJob[]>([])

    const { data, error, isLoading, mutate } = useSWR<RecipeImportJob[]>(
        session ? ["jobs", session.user.id] : null,
        async () => {
            const response = await listJobs(session!.user.id)
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
            user_id: session?.user.id || "placeholder-user-id",
            recipe_id: null,
            error_message: null,
            updated_at: new Date().toISOString(),
        }

        mutate((currentJobs = []) => [optimisticJob, ...currentJobs], false)

        try {
            // Start the job and get the actual job ID
            const jobId = await startRecipeImportJob(type, sourceData, onboardingSessionId)

            trackEvent("started_recipe_import", {
                job_id: jobId,
                method: type,
            })
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
