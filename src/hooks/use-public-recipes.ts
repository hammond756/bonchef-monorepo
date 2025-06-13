"use client"

import { useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import { useSearchParams } from "next/navigation"

const PAGE_SIZE = 12

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePublicRecipes() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const getKey = useCallback(
    (pageIndex: number) => {
      const page = pageIndex + 1
      const searchParam = query ? `&q=${encodeURIComponent(query)}` : ""
      return `/api/public/recipes?page=${page}&pageSize=${PAGE_SIZE}${searchParam}`
    },
    [query]
  )

  const { data, error, setSize, isLoading, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  )

  const recipes = data ? data.flatMap((page) => page?.data || []) : []
  const totalCount = data?.[0]?.count || 0
  const hasMore = !error && recipes.length < totalCount

  const loadMore = useCallback(async () => {
    if (isLoading) return
    await setSize((size) => size + 1)
  }, [setSize, isLoading])

  return {
    recipes,
    isLoading,
    error,
    hasMore,
    loadMore,
    mutate,
  }
} 