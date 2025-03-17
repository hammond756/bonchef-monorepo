"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { useRecipeTimeline } from "@/hooks/use-recipe-timeline"

export function PublicRecipeTimeline() {
  const { recipes, fetchRecipes, loadMore } = useRecipeTimeline()
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const result = await fetchRecipes()
        setHasMore(result.hasMore)  
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchRecipes])

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      await loadMore()
      const result = await fetchRecipes()
      setHasMore(result.hasMore)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id}>
            <Link
              href={`/recipes/${recipe.id}`}
              className="group block"
            >
              <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <p className="text-sm text-gray-500 font-medium">
                    {recipe.profiles?.display_name || "Anonieme chef"}
                  </p>
                </CardHeader>
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={recipe.thumbnail || "https://placekitten.com/800/450"}
                    alt={recipe.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-2">
                    {recipe.title}
                  </h3>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-sm text-gray-500">
                    {recipe.created_at 
                      ? format(new Date(recipe.created_at), "d MMMM yyyy", { locale: nl }) 
                      : ""}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}

      {!loading && hasMore && recipes.length > 0 && (
        <div className="flex justify-center py-4">
          <Button 
            onClick={handleLoadMore}
            variant="outline"
            className="min-w-[200px]"
          >
            Laad meer
          </Button>
        </div>
      )}

      {!loading && !hasMore && recipes.length > 0 && (
        <p className="py-4 text-center text-gray-500">
          Je hebt alle recepten bekeken!
        </p>
      )}

      {!loading && recipes.length === 0 && (
        <p className="py-4 text-center text-gray-500">
          Er zijn nog geen openbare recepten beschikbaar.
        </p>
      )}
    </div>
  )
} 