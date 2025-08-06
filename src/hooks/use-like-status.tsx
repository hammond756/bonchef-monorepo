"use client"

import useSWR from "swr"
import { useSession } from "@/hooks/use-session"
import { likeRecipe, unlikeRecipe, isRecipeLiked } from "@/lib/services/likes/client"
import { trackEvent } from "@/lib/analytics/track"

export function useLikeStatus(recipeId: string, initialIsLiked?: boolean) {
    const { session } = useSession()

    const {
        data: isLiked,
        error,
        mutate,
        isLoading,
    } = useSWR(session ? ["like-status", recipeId] : null, () => isRecipeLiked(recipeId), {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        fallbackData: initialIsLiked,
    })

    const toggle = async () => {
        if (!session) return

        const mutation = async (currentStatus: boolean = false) => {
            if (currentStatus) {
                trackEvent("unliked_recipe", {
                    recipe_id: recipeId,
                })
                await unlikeRecipe(recipeId)
            } else {
                trackEvent("liked_recipe", {
                    recipe_id: recipeId,
                })
                await likeRecipe(recipeId)
            }
            return !currentStatus
        }

        await mutate(mutation, {
            optimisticData: (currentStatus: boolean = false) => !currentStatus,
            rollbackOnError: true,
            revalidate: false,
        })
    }

    return {
        isLiked: isLiked || false,
        isLoading: isLoading,
        error,
        toggle,
    }
}
