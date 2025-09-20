"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { useSession } from "@/hooks/use-session"
import {
    bookmarkRecipe,
    unbookmarkRecipe,
    isRecipeBookmarked,
} from "@/lib/services/bookmarks/client"
import { trackEvent } from "@/lib/analytics/track"

export function useBookmarkStatus(recipeId: string, initialIsBookmarked?: boolean) {
    const { session } = useSession()

    const {
        data: isBookmarked,
        error,
        mutate,
        isLoading,
    } = useSWR(session ? ["bookmark-status", recipeId] : null, () => isRecipeBookmarked(recipeId), {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        fallbackData: initialIsBookmarked,
    })

    const toggle = async () => {
        if (!session) return

        const mutation = async (currentStatus: boolean = false) => {
            if (currentStatus) {
                trackEvent("removed_bookmark", {
                    recipe_id: recipeId,
                })
                await unbookmarkRecipe(recipeId)
            } else {
                trackEvent("added_bookmark", {
                    recipe_id: recipeId,
                })
                await bookmarkRecipe(recipeId)
            }
            return !currentStatus
        }

        await mutate(mutation, {
            optimisticData: (currentStatus: boolean = false) => !currentStatus,
            rollbackOnError: true,
            revalidate: false,
        })

        await globalMutate(["bookmarked-recipes"])
    }

    return {
        isBookmarked: isBookmarked || false,
        isLoading: isLoading,
        error,
        toggle,
    }
}
