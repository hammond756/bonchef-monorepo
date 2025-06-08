"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { likeRecipe, unlikeRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { cn } from "@/lib/utils"

type LikeButtonSize = "xs" | "sm" | "md" | "lg" | "2xl"

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
  buttonSize = "md",
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

  const sizeStylesDefinition = {
    xs: { button: "h-10 w-10", icon: "h-5 w-5", text: "text-[10px]" },
    sm: { button: "h-9 w-9", icon: "h-5 w-5", text: "text-xs" },
    md: { button: "h-12 w-12", icon: "h-6 w-6", text: "text-sm" },
    lg: { button: "h-14 w-14", icon: "h-7 w-7", text: "text-base" },
    "2xl": { button: "h-16 w-16", icon: "h-8 w-8", text: "text-lg" },
  }

  const currentSizeStyles = sizeStylesDefinition[buttonSize]

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
        data-testid="like-recipe-button-icon"
        className={cn(
          "flex items-center justify-center rounded-full cursor-pointer",
          currentSizeStyles.button,
          "bg-white/80 hover:bg-white/95",
          "focus:outline-none",
          isLoading && "opacity-50 cursor-not-allowed",
          propsClassName
        )}
      >
        <Heart
          className={cn(
            currentSizeStyles.icon,
            isLiked ? "text-red-500" : "text-gray-700"
          )}
          fill={isLiked ? "currentColor" : "none"}
        />
      </div>

      {showCount && (
        <div className={cn(
          "text-white text-xs font-medium drop-shadow-sm",
          currentSizeStyles.text
        )} data-testid="like-count">
          {likeCount}
        </div>
      )}
    </div>
  )
}
