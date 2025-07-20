"use client"

import { useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Heart } from "lucide-react"
import { likeRecipe, unlikeRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { cn } from "@/lib/utils"
import { lightThemeClasses, darkThemeClasses } from "@/components/recipe/action-button-variants"
import { useUser } from "@/hooks/use-user"

const likeButtonVariants = cva(
    "group flex items-center justify-center rounded-full transition-all duration-200 ease-in-out",
    {
        variants: {
            theme: {
                light: lightThemeClasses,
                dark: darkThemeClasses,
            },
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-12 w-12",
            },
        },
        defaultVariants: {
            theme: "light",
            size: "md",
        },
    }
)

const iconVariants = cva("transition-all duration-200 ease-in-out group-hover:scale-110", {
    variants: {
        size: {
            sm: "h-4 w-4",
            md: "h-5 w-5",
            lg: "h-6 w-6",
        },
    },
    defaultVariants: {
        size: "md",
    },
})

const textVariants = cva("text-xs font-medium text-white drop-shadow-sm")

export interface LikeButtonProps
    extends VariantProps<typeof likeButtonVariants>,
        Omit<VariantProps<typeof textVariants>, "size"> {
    recipeId: string
    initialLiked: boolean
    initialLikeCount: number
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg"
    enabled?: boolean
}

export function LikeButton({
    size,
    recipeId,
    initialLiked,
    initialLikeCount,
    showCount = true,
    className,
    theme,
}: LikeButtonProps) {
    const { user } = useUser()
    const [isLiked, setIsLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const { mutate: mutateLikedRecipes } = useLikedRecipes({ enabled: !!user })

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsLoading(true)
        const previousIsLiked = isLiked
        const previousLikeCount = likeCount

        // Optimistic update
        setIsLiked(!isLiked)
        setLikeCount(previousIsLiked ? likeCount - 1 : likeCount + 1)

        try {
            if (previousIsLiked) {
                await unlikeRecipe(recipeId)
            } else {
                await likeRecipe(recipeId)
            }
            // After successful action, revalidate the liked recipes list
            mutateLikedRecipes()
        } catch (error) {
            // Rollback on error
            setIsLiked(previousIsLiked)
            setLikeCount(previousLikeCount)
            toast({
                title: "Er is iets misgegaan",
                description: error instanceof Error ? error.message : "Probeer het later opnieuw",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleLike}
                disabled={isLoading}
                aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
                data-testid="like-recipe-button"
                className={cn(likeButtonVariants({ size, theme }), className)}
            >
                <Heart
                    className={cn(
                        iconVariants({ size }),
                        isLiked
                            ? cn("fill-status-red-bg", {
                                  "text-status-red-bg": theme === "dark",
                                  "text-status-red": theme !== "dark",
                              })
                            : cn("fill-none", {
                                  "text-surface": theme === "dark",
                                  "text-foreground": theme !== "dark",
                              })
                    )}
                />
            </button>

            {showCount && (
                <span className={cn(textVariants())} data-testid="like-count">
                    {likeCount}
                </span>
            )}
        </div>
    )
}
