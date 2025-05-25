"use client"

import { useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import { useQueryState, parseAsInteger } from "nuqs"

const PAGE_SIZE = 12

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePublicRecipes() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  const getKey = useCallback(
    (pageIndex: number) => {
      return `/api/public/recipes?offset=${pageIndex + 1}&page_size=${PAGE_SIZE}`
    },
    []
  )

  const { data, error, size, setSize, isLoading, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  )

  const recipes = data ? data.flatMap((page) => page.data) : []
  const totalCount = data?.[0]?.count || 0
  const hasMore = recipes.length < totalCount

  const loadMore = useCallback(async () => {
    await setSize((size) => size + 1)
    await setPage(size + 1)
  }, [setSize, setPage, size])

  return {
    recipes,
    isLoading,
    error,
    hasMore,
    loadMore,
    mutate,
  }
} 