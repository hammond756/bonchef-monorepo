"use client"

import { RecipeImportJob } from "@/lib/types"
import useSWR from "swr"

const fetcher = async (): Promise<RecipeImportJob[]> => {
    const response = await fetch("/api/collection/jobs")
    if (!response.ok) {
        throw new Error("Failed to fetch recipe import jobs")
    }
    return response.json()
}

export function useRecipeImportJobs() {
    const { data, error, isLoading, mutate } = useSWR<RecipeImportJob[]>(
        "recipe-import-jobs",
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            // Poll every 2 seconds to check for job status updates.
            refreshInterval: 2000,
        }
    )

    return {
        jobs: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}
