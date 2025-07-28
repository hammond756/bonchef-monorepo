import { getCommentCount } from "@/lib/services/comments/client"
import useSWR from "swr"

export function useCommentCount(recipeId: string) {
    const { data, mutate } = useSWR(
        recipeId ? ["comment-count", recipeId] : null,
        () => getCommentCount(recipeId),
        {
            revalidateOnFocus: false,
        }
    )

    return {
        count: data || 0,
        mutate: mutate,
    }
}
