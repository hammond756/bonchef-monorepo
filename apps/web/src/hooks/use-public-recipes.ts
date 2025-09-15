"use client"

import { useSearchParams } from "next/navigation"
import { usePublicRecipes as usePublicRecipesLib } from "@repo/lib/hooks/use-public-recipes"

export function usePublicRecipes() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""
    
    return usePublicRecipesLib(query)
}
