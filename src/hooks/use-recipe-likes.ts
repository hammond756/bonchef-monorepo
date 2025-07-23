import { useUser } from "@/hooks/use-user"
import useSWR from "swr"
import { Recipe } from "@/lib/types"

interface UseRecipeLikesOptions {
    enabled?: boolean
}

/**
 * Hook for managing recipe likes
 * Note: This is primarily for future use if we need to track liked recipes
 */
export function useRecipeLikes(options: UseRecipeLikesOptions = {}) {
    const { enabled = true } = options
    const { user } = useUser()

    const { data, error, mutate } = useSWR<Recipe[]>(
        enabled && user ? "/api/user/liked-recipes" : null,
        {
            // We don't have a liked recipes endpoint yet, but this is here for future use
            fallbackData: [],
        }
    )

    return {
        likedRecipes: data || [],
        isLoading: !error && !data && enabled,
        error,
        mutate,
    }
}
