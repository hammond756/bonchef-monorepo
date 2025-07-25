import { useState, useEffect, useCallback } from "react"

// Simple cache for comment counts
const commentCountCache = new Map<string, { count: number; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useCommentCount(recipeId: string, initialCount: number = 0) {
    const [commentCount, setCommentCount] = useState(initialCount)
    const [isLoading, setIsLoading] = useState(false)

    // Fetch comment count from API with caching
    const fetchCommentCount = useCallback(
        async (forceRefresh = false) => {
            // Check cache first
            const cached = commentCountCache.get(recipeId)
            const now = Date.now()

            if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION) {
                setCommentCount(cached.count)
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch(`/api/recipes/${recipeId}/comment-count`)
                if (response.ok) {
                    const data = await response.json()
                    const count = data.count

                    // Update cache
                    commentCountCache.set(recipeId, { count, timestamp: now })
                    setCommentCount(count)
                }
            } catch (error) {
                console.error("Error fetching comment count:", error)
            } finally {
                setIsLoading(false)
            }
        },
        [recipeId]
    )

    // Only fetch on mount if we don't have a valid cached value
    useEffect(() => {
        const cached = commentCountCache.get(recipeId)
        const now = Date.now()

        if (!cached || now - cached.timestamp >= CACHE_DURATION) {
            fetchCommentCount()
        } else {
            setCommentCount(cached.count)
        }
    }, [recipeId, fetchCommentCount])

    // Update count when initialCount changes (e.g., when recipe data is refreshed)
    // Only if we don't have a cached value or if initialCount is higher than cached
    useEffect(() => {
        const cached = commentCountCache.get(recipeId)
        if (!cached || initialCount > cached.count) {
            setCommentCount(initialCount)
            if (initialCount > 0) {
                commentCountCache.set(recipeId, { count: initialCount, timestamp: Date.now() })
            }
        }
    }, [initialCount, recipeId])

    const incrementCount = () => {
        setCommentCount((prev) => prev + 1)
        // Update cache immediately
        commentCountCache.set(recipeId, { count: commentCount + 1, timestamp: Date.now() })
    }

    const decrementCount = () => {
        const newCount = Math.max(0, commentCount - 1)
        setCommentCount(newCount)
        // Update cache immediately
        commentCountCache.set(recipeId, { count: newCount, timestamp: Date.now() })
    }

    return {
        commentCount,
        incrementCount,
        decrementCount,
        isLoading,
        refetch: () => fetchCommentCount(true),
    }
}
