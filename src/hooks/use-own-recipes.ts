"use client"

import { RecipeRead } from "@/lib/types"
import useSWR from "swr"

const fetcher = async (): Promise<RecipeRead[]> => {
    const response = await fetch("/api/collection")
    if (!response.ok) {
        throw new Error("Failed to fetch own recipes")
    }
    return response.json()
}

export function useOwnRecipes() {
    const { data, error, isLoading, mutate } = useSWR<RecipeRead[]>("own-recipes", fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 2000,
    })

    return {
        recipes: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}
