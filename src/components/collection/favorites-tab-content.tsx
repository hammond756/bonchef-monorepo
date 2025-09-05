import { useMemo } from "react"
import { useBookmarkedRecipes } from "@/hooks/use-bookmarked-recipes"
import { RecipePageSkeleton } from "./recipe-page-skeleton"
import { FavoritesCTA } from "./favorites-cta"
import { RecipeGrid } from "./recipe-grid"
import { RecipeList } from "./recipe-list"

interface FavoritesTabContentProps {
    viewMode: "grid" | "list"
    sortOrder: "newest" | "oldest"
}

/**
 * Content for the favorites tab showing bookmarked recipes
 */
export function FavoritesTabContent({ viewMode, sortOrder }: FavoritesTabContentProps) {
    const { recipes: bookmarkedRecipes, isLoading: bookmarkedRecipesLoading } =
        useBookmarkedRecipes()

    const sortedLikedRecipes = useMemo(() => {
        const sorted = [...(bookmarkedRecipes || [])]
        sorted.sort((a, b) => {
            const dateA = new Date(a.created_at ?? 0).getTime()
            const dateB = new Date(b.created_at ?? 0).getTime()
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB
        })
        return sorted.map((r) => ({ ...r, viewType: "RECIPE" as const }))
    }, [bookmarkedRecipes, sortOrder])

    if (bookmarkedRecipesLoading) {
        return <RecipePageSkeleton />
    }

    if (sortedLikedRecipes.length === 0) {
        return <FavoritesCTA />
    }

    if (viewMode === "grid") {
        return <RecipeGrid items={sortedLikedRecipes} />
    }

    return <RecipeList items={sortedLikedRecipes} />
}
