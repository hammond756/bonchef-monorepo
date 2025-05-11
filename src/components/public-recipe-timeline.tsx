"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Loader2, User as UserIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { usePublicRecipes } from "@/hooks/use-public-recipes"
import { LikeButton } from "./like-button"
import { ProfileImage } from "@/components/ui/profile-image"

export function PublicRecipeTimeline() {
  const { recipes, isLoading, hasMore, loadMore } = usePublicRecipes()

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id}>
              <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <Link href={`/profiles/~${recipe.profiles?.id}`} className="flex items-center gap-3 group">
                    <ProfileImage src={recipe.profiles?.avatar} name={recipe.profiles?.display_name} size={40} />
                    <span className="text-md font-semibold text-gray-800 underline group-hover:text-primary transition-colors">
                      {recipe.profiles?.display_name || "Anonieme chef"}
                    </span>
                  </Link>
                </CardHeader>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="group block"
                >
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
                </Link>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {recipe.created_at 
                      ? format(new Date(recipe.created_at), "d MMMM yyyy", { locale: nl }) 
                      : ""}
                  </p>
                  <LikeButton 
                    recipeId={recipe.id} 
                    initialLiked={recipe.is_liked_by_current_user} 
                    initialLikeCount={recipe.like_count || 0}
                  />
                </CardFooter>
              </Card>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}

      {!isLoading && hasMore && recipes.length > 0 && (
        <div className="flex justify-center py-4">
          <Button 
            onClick={loadMore}
            variant="outline"
            className="min-w-[200px]"
          >
            Laad meer
          </Button>
        </div>
      )}

      {!isLoading && !hasMore && recipes.length > 0 && (
        <p className="py-4 text-center text-gray-500">
          Je hebt alle recepten bekeken!
        </p>
      )}

      {!isLoading && recipes.length === 0 && (
        <p className="py-4 text-center text-gray-500">
          Er zijn nog geen openbare recepten beschikbaar.
        </p>
      )}
    </div>
  )
} 