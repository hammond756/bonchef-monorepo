import useSWR from "swr"
import { Comment } from "@/lib/types"

interface UseCommentsOptions {
    recipeId: string
    enabled?: boolean
}

interface UseCommentsReturn {
    comments: Comment[]
    isLoading: boolean
    error: string | null
    mutate: (data?: Comment[], options?: { revalidate?: boolean }) => Promise<Comment[] | undefined>
}

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<Comment[]> => {
    const response = await fetch(url)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch comments")
    }
    return response.json()
}

/**
 * Hook for fetching and managing comments for a recipe using SWR
 */
export function useComments({ recipeId, enabled = true }: UseCommentsOptions): UseCommentsReturn {
    const {
        data: comments = [],
        error,
        isLoading,
        mutate,
    } = useSWR(enabled && recipeId ? `/api/recipes/${recipeId}/comments` : null, fetcher, {
        refreshInterval: 1500, // Poll every 1.5 seconds
        revalidateOnFocus: false, // Don't revalidate when window gains focus
        revalidateOnReconnect: true, // Revalidate when reconnecting
    })

    return {
        comments,
        isLoading,
        error: error?.message || null,
        mutate,
    }
}
