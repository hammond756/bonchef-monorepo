"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Loader2 } from "lucide-react"
import { usePublicRecipes } from "@/hooks/use-public-recipes"
import { RecipeFeedCard } from "@/components/recipe/recipe-feed-card"

export function PublicRecipeTimeline() {
    const { recipes, isLoading, hasMore, loadMore, error } = usePublicRecipes()
    const { ref, inView } = useInView({ threshold: 0.5 })

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            loadMore()
        }
    }, [inView, hasMore, isLoading, loadMore])

    return (
        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
                <RecipeFeedCard key={recipe.id} recipe={recipe} />
            ))}

            {hasMore && (
                <div ref={ref} className="flex h-20 items-center justify-center">
                    {isLoading && <Loader2 className="h-8 w-8 animate-spin text-gray-500" />}
                </div>
            )}

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-center">
                    <p className="text-sm font-medium text-red-700">
                        Oeps, er is iets misgegaan bij het laden van recepten. Probeer het later
                        opnieuw.
                    </p>
                </div>
            )}

            {!isLoading && !hasMore && recipes.length > 0 && (
                <p className="py-4 text-center text-gray-500">Je hebt alle recepten bekeken!</p>
            )}

            {!isLoading && !hasMore && recipes.length === 0 && !error && (
                <p className="py-4 text-center text-gray-500">
                    Er zijn nog geen openbare recepten beschikbaar.
                </p>
            )}
        </div>
    )
}
