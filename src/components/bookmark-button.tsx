"use client"

import { useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { BookmarkIcon } from "lucide-react"
import { bookmarkRecipe, unbookmarkRecipe } from "@/app/ontdek/actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { lightThemeClasses, darkThemeClasses } from "@/components/recipe/action-button-variants"
import { useUser } from "@/hooks/use-user"
import { useBookmarkedRecipes } from "@/hooks/use-bookmarked-recipes"

const bookmarkButtonVariants = cva(
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

export interface BookmarkButtonProps
    extends VariantProps<typeof bookmarkButtonVariants>,
        Omit<VariantProps<typeof textVariants>, "size"> {
    recipeId: string
    initialBookmarked: boolean
    initialBookmarkCount: number
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg"
    enabled?: boolean
}

export function BookmarkButton({
    size,
    recipeId,
    initialBookmarked,
    initialBookmarkCount,
    showCount = true,
    className,
    theme,
}: BookmarkButtonProps) {
    const { user } = useUser()
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
    const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const { mutate: mutateBookmarkedRecipes } = useBookmarkedRecipes({ enabled: !!user })

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsLoading(true)
        const previousIsBookmarked = isBookmarked
        const previousBookmarkCount = bookmarkCount

        // Optimistic update
        setIsBookmarked(!isBookmarked)
        setBookmarkCount(previousIsBookmarked ? bookmarkCount - 1 : bookmarkCount + 1)

        try {
            if (previousIsBookmarked) {
                await unbookmarkRecipe(recipeId)
            } else {
                await bookmarkRecipe(recipeId)
            }
            // After successful action, revalidate the liked recipes list
            mutateBookmarkedRecipes()
        } catch (error) {
            // Rollback on error
            setIsBookmarked(previousIsBookmarked)
            setBookmarkCount(previousBookmarkCount)
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
                aria-label={isBookmarked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
                data-testid="bookmark-recipe-button"
                className={cn(bookmarkButtonVariants({ size, theme }), className)}
            >
                <BookmarkIcon
                    className={cn(
                        iconVariants({ size }),
                        isBookmarked
                            ? cn("fill-surface", {
                                  "text-surface fill-surface": theme === "dark",
                                  "text-foreground fill-foreground": theme !== "dark",
                              })
                            : cn("fill-none", {
                                  "text-surface": theme === "dark",
                                  "text-foreground": theme !== "dark",
                              })
                    )}
                />
            </button>

            {showCount && (
                <span className={cn(textVariants())} data-testid="bookmark-count">
                    {bookmarkCount}
                </span>
            )}
        </div>
    )
}
