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
}

export function LikeButton({ recipeId, initialLiked = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const { mutate: mutateLikedRecipes } = useLikedRecipes()

  const handleLike = async () => {
    setIsLoading(true)
    try {
      if (isLiked) {
        await unlikeRecipe(recipeId)
        setIsLiked(false)
        mutateLikedRecipes()
      } else {
        await likeRecipe(recipeId)
        setIsLiked(true)
        mutateLikedRecipes()
      }
    } catch (error) {
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
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLike}
      disabled={isLoading}
      className="hover:bg-red-50 hover:text-red-500"
      aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      data-testid="like-recipe-button"
    >
      <Heart
        className={`h-5 w-5 text-red-500 ${isLiked ? "fill-red-500" : ""}`}
      />
    </Button>
  )
} 