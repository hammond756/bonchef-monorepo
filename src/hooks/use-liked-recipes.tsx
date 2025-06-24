"use client"

import { RecipeRead } from "@/lib/types"
import useSWR from "swr"

const fetcher = async (url: string): Promise<RecipeRead[]> => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error("An error occurred while fetching the data.")
    }
    return res.json()
}

export function useLikedRecipes() {
    const { data, error, isLoading, mutate } = useSWR<RecipeRead[]>(
        "/api/collection/favorites",
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0, // Don't poll, just revalidate on focus/reconnect
        }
    )

    return {
        recipes: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}
