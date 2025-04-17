"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { likeRecipe, unlikeRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  recipeId: string
  initialLiked?: boolean
  initialLikeCount?: number
  variant?: "default" | "compact" | "transparent"
}

export function LikeButton({ 
  recipeId, 
  initialLiked = false, 
  initialLikeCount = 0, 
  variant = "default"
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const { mutate: mutateLikedRecipes } = useLikedRecipes()

  const handleLike = async () => {
    setIsLoading(true)
    const previousIsLiked = isLiked
    const previousLikeCount = likeCount
    
    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(previousIsLiked ? likeCount - 1 : likeCount + 1)
    
    try {
      if (previousIsLiked) {
        await unlikeRecipe(recipeId)
        mutateLikedRecipes()
      } else {
        await likeRecipe(recipeId)
        mutateLikedRecipes()
      }
    } catch (error) {
      // Rollback on error
      setIsLiked(previousIsLiked)
      setLikeCount(previousLikeCount)
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later opnieuw",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const variants = {
    default: (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            handleLike()
          }}
          disabled={isLoading}
          className={cn(
            "rounded-full px-3 py-1.5",
            isLiked ? "border-red-200 bg-red-50" : "hover:border-red-200 hover:bg-red-50"
          )}
          aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          data-testid="like-recipe-button"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
            )}
          />
          <span className={cn(
            "text-sm",
            isLiked ? "text-red-500" : "text-gray-500"
          )}>
            {likeCount}
          </span>
        </Button>
      </div>
    ),
    compact: (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          handleLike()
        }}
        disabled={isLoading}
        className="hover:text-red-500 hover:bg-transparent"
        aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
        data-testid="like-recipe-button"
      >
        <Heart
          className={cn(
            "h-5 w-5",
            isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
          )}
        />
      </Button>
    ),
    transparent: (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            handleLike()
          }}
          disabled={isLoading}
          className="hover:bg-transparent"
          aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          data-testid="like-recipe-button"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
            )}
          />
        </Button>
        <span className="text-sm text-gray-500">
          {likeCount}
        </span>
      </div>
    )
  }

  return variants[variant]
} 