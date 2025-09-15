"use client"

import { useCallback } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { getPublicRecipesWithClient } from "../services/recipes"
import { SupabaseClient } from "@supabase/supabase-js"

const PAGE_SIZE = 12

export function usePublicRecipes(supabase: SupabaseClient, query: string = "") {
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isLoading,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["public-recipes", query],
        queryFn: ({ pageParam = 1 }) => {
            return getPublicRecipesWithClient(supabase, {
                page: pageParam,
                pageSize: PAGE_SIZE,
                query: query || undefined,
            })
        },
        getNextPageParam: (lastPage, allPages) => {
            const totalCount = lastPage?.count || 0
            const currentCount = allPages.reduce((acc, page) => acc + (page?.data?.length || 0), 0)
            return currentCount < totalCount ? allPages.length + 1 : undefined
        },
        initialPageParam: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const recipes = data?.pages.flatMap((page) => page?.data || []) || []
    const totalCount = data?.pages[0]?.count || 0
    const hasMore = hasNextPage && !error

    const loadMore = useCallback(async () => {
        if (isFetching || isFetchingNextPage) return
        await fetchNextPage()
    }, [fetchNextPage, isFetching, isFetchingNextPage])

    return {
        recipes,
        isLoading,
        error,
        hasMore,
        loadMore,
        mutate: refetch,
    }
}
