import { useSession } from "@/hooks/use-session"
import { getRecipeBookmarkCount } from "@/lib/services/bookmarks/client"

import useSWR from "swr"

export function useBookmarkCount(recipeId: string, initialBookmarkCount?: number) {
    const { session } = useSession()

    const {
        data: bookmarkCount,
        isLoading,
        mutate,
    } = useSWR(
        session ? ["bookmark-count", recipeId] : null,
        () => getRecipeBookmarkCount(recipeId),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            fallbackData: initialBookmarkCount,
        }
    )

    return { bookmarkCount, isLoading, mutate }
}
