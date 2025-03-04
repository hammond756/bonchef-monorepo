"use client"

import { useCallback } from "react"
import { useRecipeTimelineStore } from "@/lib/stores/recipe-timeline-store"
import { useQueryState, parseAsInteger } from "nuqs"

const PAGE_SIZE = 10

export function useRecipeTimeline() {
  const { recipes, setRecipes, addRecipes } = useRecipeTimelineStore()
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  const fetchRecipes = useCallback(async () => {
    try {
      const response = await fetch(`/api/recipes?offset=${page}&page_size=${PAGE_SIZE}`)
      const { data, count } = await response.json()
      
      if (page === 1) {
        setRecipes(data)
      } else {
        addRecipes(data)
      }
      
      return {
        hasMore: page * PAGE_SIZE < count,
        totalCount: count
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error)
      return {
        hasMore: false,
        totalCount: 0
      }
    }
  }, [page, setRecipes, addRecipes])

  const loadMore = useCallback(async () => {
    const nextPage = page + 1
    await setPage(nextPage)
  }, [page, setPage])

  return {
    recipes,
    page,
    loadMore,
    fetchRecipes,
    pageSize: PAGE_SIZE
  }
} 