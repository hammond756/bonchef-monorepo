"use client"

import useSWR from "swr"

const fetcher = async () => {
  return await fetch("/api/collection/favorites").then((res) => res.json())
}

export function useLikedRecipes() {
  const { data, error, isLoading, mutate } = useSWR(
    "liked-recipes",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0, // Don't poll, just revalidate on focus/reconnect
    }
  )

  return {
    recipes: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}