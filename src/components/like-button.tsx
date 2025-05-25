"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { likeRecipe, unlikeRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { cn } from "@/lib/utils"

type LikeButtonSize = "sm" | "md" | "2xl"

interface LikeButtonProps {
  recipeId: string
  initialLiked?: boolean
  initialLikeCount?: number
  variant?: "solid" | "outline"
  buttonSize?: LikeButtonSize
  className?: string
}

export function LikeButton({
  recipeId,
  initialLiked = false,
  initialLikeCount = 0,
  variant = "solid",
  buttonSize = "sm",
  className: propsClassName,
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
    "2xl": { padding: "px-6 py-3.5", icon: "h-8 w-8", text: "text-lg" },
  }

  const currentSizeStyles = sizeStyles[buttonSize]

  return (
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
        // Base structure and interaction
        "flex flex-col items-center justify-center h-auto cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", // Common focus style
        currentSizeStyles.padding, // Size-dependent padding

        isLoading && "opacity-50 cursor-not-allowed", // Loading state

        // Apply the passed className for color inheritance, especially for not-liked state
        propsClassName,

        // Override the text color to red if the button is liked
        isLiked && "text-red-500",
      )}
    >
      <Heart
        className={cn(
          currentSizeStyles.icon,
          "mb-0.5",
          // Color is inherited from parent div's text color, which is set by propsClassName or 'text-white' for liked state
        )}
        fill={isLiked || variant === "solid" ? "currentColor" : "none"}
        strokeOpacity={variant === "outline" && !isLiked ? 1 : 0}
        strokeWidth={variant === "outline" && !isLiked ? 1.5 : 0} // Using 1.5 for a slightly thinner outline, lucide default is 2
      />
      <span
        className={cn(
          currentSizeStyles.text
        )}
      >
        {likeCount}
      </span>
    </div>
  )
}
