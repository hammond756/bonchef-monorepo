"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { likeRecipe, unlikeRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { cn } from "@/lib/utils"

type LikeButtonSize = "sm" | "md" | "lg" | "2xl"

interface LikeButtonProps {
  recipeId: string
  initialLiked?: boolean
  initialLikeCount?: number
  variant?: "solid" | "outline"
  buttonSize?: LikeButtonSize
  className?: string
  showCount?: boolean
}

export function LikeButton({
  recipeId,
  initialLiked = false,
  initialLikeCount = 0,
  variant = "solid",
  buttonSize = "sm",
  className: propsClassName,
  showCount = true,
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
        description: (error instanceof Error) ? error.message : "Probeer het later opnieuw",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeStyles = {
    sm: { padding: "px-3 py-2", icon: "h-4 w-4", text: "text-xs" },
    md: { padding: "px-4 py-2.5", icon: "h-5 w-5", text: "text-sm" },
    lg: { padding: "px-5 py-3", icon: "h-6 w-6", text: "text-base" },
    "2xl": { padding: "px-6 py-3.5", icon: "h-8 w-8", text: "text-lg" },
  }

  const currentSizeStyles = sizeStyles[buttonSize]

  return (
    <div className="flex flex-col items-center space-y-1">
      <div
        role="button"
        tabIndex={isLoading ? -1 : 0}
        onClick={(e: React.MouseEvent) => {
          if (isLoading) return
          e.preventDefault()
          e.stopPropagation()
          handleLike()
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (isLoading) return
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            e.stopPropagation()
            handleLike()
          }
        }}
        aria-disabled={isLoading}
        aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
        data-testid="like-recipe-button"
        className={cn(
          "flex items-center justify-center h-12 w-12 rounded-full cursor-pointer",
          "bg-white/80 hover:bg-white/95",
          "focus:outline-none",
          isLoading && "opacity-50 cursor-not-allowed",
          propsClassName
        )}
      >
        <Heart
          className={cn(
            "h-6 w-6",
            isLiked ? "text-red-500" : "text-gray-700"
          )}
          fill={isLiked ? "currentColor" : "none"}
        />
      </div>

      {showCount && (
        <div className={cn(
          "text-white text-xs font-medium drop-shadow-sm"
        )} data-testid="like-count">
          {likeCount}
        </div>
      )}
    </div>
  )
}
