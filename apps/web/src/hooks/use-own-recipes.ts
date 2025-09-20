"use client"

import useSWR from "swr"
import { RecipeRead } from "@/lib/types"
import { useSession } from "@/hooks/use-session"

async function fetcher(url: string): Promise<RecipeRead[]> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error("Failed to fetch recipes")
    }
    const data = await response.json()
    return Array.isArray(data) ? data : data.recipes || []
}

export function useOwnRecipes() {
    const { session } = useSession()

    const { data, error, isLoading, mutate } = useSWR<RecipeRead[]>(
        session ? "/api/collection" : null,
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
        }
    )

    const count = () => {
        if (!session?.user.id) {
            return 0
        }

        return data?.length || 0
    }

    return {
        recipes: data || [],
        isLoading,
        error,
        mutate,
        count,
    }
}
