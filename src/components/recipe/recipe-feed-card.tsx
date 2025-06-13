"use client"

import { useState } from "react"
import Link from "next/link"
import { Recipe } from "@/lib/types"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { LikeButton } from "@/components/like-button"
import { ProfileImage } from "@/components/ui/profile-image"
import { Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function ShareButton({ recipeId }: { recipeId: string }) {
  const { toast } = useToast()
  const recipeUrl = `${window.location.origin}/recipes/${recipeId}`

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bekijk dit recept op Bonchef!",
          url: recipeUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(recipeUrl)
      toast({
        title: "Link gekopieerd!",
        description: "De link naar het recept is gekopieerd naar je klembord.",
      })
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={handleShare}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
        aria-label="Deel recept"
      >
        <Share2 className="h-5 w-5" />
      </button>
      <span className="text-[10px] font-medium text-white drop-shadow-sm">
        Delen
      </span>
    </div>
  )
}

interface RecipeFeedCardProps {
  recipe: Recipe
}

const MAX_CAPTION_LENGTH = 100

export function RecipeFeedCard({ recipe }: RecipeFeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const caption = recipe.description || ""
  const isLongCaption = caption.length > MAX_CAPTION_LENGTH
  const displayedCaption =
    isLongCaption && !isExpanded
      ? `${caption.substring(0, MAX_CAPTION_LENGTH)}...`
      : caption

  return (
    <div className="w-full snap-center px-4">
      <Card className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <Link href={`/recipes/${recipe.id}`} className="absolute inset-0">
          <Image
            src={recipe.thumbnail || "https://placekitten.com/900/1200"}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              isExpanded
                ? "bg-gradient-to-t from-black/60 via-black/40 to-black/20"
                : "bg-gradient-to-t from-black/50 via-black/20 to-transparent"
            }`}
          />
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pr-20">
          <div className="mb-4">
            <p className="text-sm">
              {displayedCaption}
              {isLongCaption && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded)
                  }}
                  className="ml-1 font-semibold text-gray-300 hover:text-white"
                >
                  {isExpanded ? "minder" : "meer"}
                </button>
              )}
            </p>
          </div>
          <h2 className="text-2xl font-bold leading-tight line-clamp-3">{recipe.title}</h2>
          <p className="mt-1 text-sm">
            door {recipe.profiles?.display_name || "een anonieme chef"}
          </p>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col items-center space-y-4">
          <ShareButton recipeId={recipe.id} />
          <LikeButton
            recipeId={recipe.id}
            initialLiked={recipe.is_liked_by_current_user}
            initialLikeCount={recipe.like_count || 0}
            buttonSize="xs"
            showCount={true}
            theme="dark"
          />
          <Link href={`/profiles/~${recipe.profiles?.id}`} onClick={(e) => e.stopPropagation()} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50">
            <ProfileImage
              src={recipe.profiles?.avatar}
              name={recipe.profiles?.display_name}
              size={36}
              className="border-2 border-transparent"
            />
          </Link>
        </div>
      </Card>
    </div>
  )
} 