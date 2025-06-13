"use client"

import { RecipeRead } from "@/lib/types"
import useSWR from "swr"

const fetcher = async (): Promise<RecipeRead[]> => {
    return await fetch("/api/collection/favorites").then((res) => res.json())
}

export function useLikedRecipes() {
    const { data, error, isLoading, mutate } = useSWR<RecipeRead[]>("liked-recipes", fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 0, // Don't poll, just revalidate on focus/reconnect
    })

    return {
        recipes: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}
