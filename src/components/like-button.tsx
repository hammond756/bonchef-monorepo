"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { likeRecipe, unlikeRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"

interface LikeButtonProps {
  recipeId: string
  initialLiked?: boolean
  initialLikeCount?: number
  showCount?: boolean
}

export function LikeButton({ recipeId, initialLiked = false, initialLikeCount = 0, showCount = true }: LikeButtonProps) {
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

  return (
    <div className="flex items-center gap-1">
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
          className={`h-5 w-5 text-red-500 ${isLiked ? "fill-red-500" : ""}`}
        />
      </Button>
      {showCount && (
        <span className="text-sm text-gray-500" data-testid="like-count">
          {likeCount}
        </span>
      )}
    </div>
  )
} 