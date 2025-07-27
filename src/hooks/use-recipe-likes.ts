import useSWR from "swr"
import { Recipe } from "@/lib/types"
import { useSession } from "./use-session"

/**
 * Hook for managing recipe likes
 * Note: This is primarily for future use if we need to track liked recipes
 */
export function useRecipeLikes() {
    const { session } = useSession()

    const { data, error, mutate } = useSWR<Recipe[]>(session ? "/api/user/liked-recipes" : null, {
        // We don't have a liked recipes endpoint yet, but this is here for future use
        fallbackData: [],
    })

    return {
        likedRecipes: data || [],
        isLoading: !error && !data,
        error,
        mutate,
    }
}
