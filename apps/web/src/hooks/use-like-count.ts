import { useSession } from "@/hooks/use-session"
import { getRecipeLikeCount } from "@/lib/services/likes/client"

import useSWR from "swr"

export function useLikeCount(recipeId: string, initialLikeCount?: number) {
    const { session } = useSession()

    const {
        data: likeCount,
        isLoading,
        mutate,
    } = useSWR(session ? ["like-count", recipeId] : null, () => getRecipeLikeCount(recipeId), {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        fallbackData: initialLikeCount,
    })

    return { likeCount, isLoading, mutate }
}
