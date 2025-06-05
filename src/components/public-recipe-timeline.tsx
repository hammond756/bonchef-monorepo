"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { usePublicRecipes } from "@/hooks/use-public-recipes"
import { LikeButton } from "./like-button"
import { ProfileImage } from "@/components/ui/profile-image"

export function PublicRecipeTimeline() {
  const { recipes, isLoading, hasMore, loadMore } = usePublicRecipes()

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="w-full">
            <Card className="relative aspect-square w-full overflow-hidden group">
              <Link
                href={`/recipes/${recipe.id}`}
                className="absolute inset-0 block"
              >
                <Image
                  src={recipe.thumbnail || "https://placekitten.com/1200/800"}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </Link>

              <div className="absolute bottom-0 left-0 right-0 px-5 text-white">
                {/* Recipe Title - Bottom Left, above User Info */}
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block mb-4 w-10/12" // Keep some margin below title if needed
                >
                  <h3 className="text-xl md:text-3xl font-medium line-clamp-2">
                    {recipe.title}
                  </h3>
                </Link>

                {/* User Info: Display Name and Date - Bottom Left, below Title */}
                <Link 
                  href={`/profiles/~${recipe.profiles?.id}`} 
                  className="block mb-2 group/profile"
                >
                  <span className="text-sm font-semibold group-hover/profile:text-primary transition-colors">
                    {recipe.profiles?.display_name || "Anonieme chef"}
                  </span>
                  <span className="mx-2 text-xs text-gray-300 group-hover/profile:text-primary transition-colors">
                    |
                  </span>
                  <span className="text-xs text-gray-300 group-hover/profile:text-primary transition-colors">
                    {recipe.created_at
                      ? format(new Date(recipe.created_at), "d MMM yyyy", { locale: nl })
                      : ""}
                  </span>
                </Link>


                {/* Right-aligned content: Like Button and Profile Image */}
                <div className="absolute bottom-2 right-4 flex flex-col items-center space-y-2">
                  <LikeButton
                    variant="solid"
                    className="text-white/70"
                    buttonSize="xs"
                    recipeId={recipe.id}
                    initialLiked={recipe.is_liked_by_current_user}
                    initialLikeCount={recipe.like_count || 0}
                  />
                  <Link 
                    href={`/profiles/~${recipe.profiles?.id}`} 
                    className="group/profile"
                  >
                    <ProfileImage 
                      src={recipe.profiles?.avatar} 
                      name={recipe.profiles?.display_name} 
                      size={40}
                      className="border-2 border-white group-hover/profile:border-primary transition-colors"
                    />
                  </Link>
                </div>
              </div>
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