"use client"

import useSWR from "swr"
import { useSession } from "@/hooks/use-session"
import { getBookmarkedRecipes } from "@/lib/services/bookmarks/client"

export function useBookmarkedRecipes() {
    const { session } = useSession()

    const {
        data: recipes,
        error,
        isLoading,
        mutate,
    } = useSWR(session ? ["bookmarked-recipes"] : null, () => getBookmarkedRecipes(), {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 0, // Don't poll, just revalidate on focus/reconnect
    })

    return {
        recipes: recipes || [],
        isLoading,
        isError: error,
        mutate,
    }
}
