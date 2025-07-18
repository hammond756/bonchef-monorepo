"use client"

import useSWR from "swr"
import { RecipeRead } from "@/lib/types"

async function fetcher(url: string): Promise<RecipeRead[]> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error("Failed to fetch recipes")
    }
    const data = await response.json()
    return Array.isArray(data) ? data : data.recipes || []
}

export function useOwnRecipes() {
    const { data, error, isLoading, mutate } = useSWR<RecipeRead[]>("/api/collection", fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 2000,
    })

    return {
        recipes: data || [],
        isLoading,
        error,
        mutate,
    }
}
