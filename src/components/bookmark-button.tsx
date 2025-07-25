"use client"

import { useState } from "react"
import { BookmarkIcon } from "lucide-react"
import { bookmarkRecipe, unbookmarkRecipe } from "@/app/ontdek/actions"
import { ActionButton } from "@/components/recipe/action-button"
import { useBookmarkedRecipes } from "@/hooks/use-bookmarked-recipes"
import { redirect } from "next/navigation"

export interface BookmarkButtonProps {
    recipeId: string
    initialBookmarked: boolean
    initialBookmarkCount: number
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg"
    iconSize?: "sm" | "md" | "lg" | "xl"
    enabled?: boolean
}

export function BookmarkButton({
    size,
    iconSize,
    recipeId,
    initialBookmarked,
    initialBookmarkCount,
    showCount = true,
    className,
    theme,
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
    const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount)
    const [isLoading, setIsLoading] = useState(false)

    const { mutate: mutateBookmarkedRecipes } = useBookmarkedRecipes({ enabled: true })

    const handleToggle = async () => {
        setIsLoading(true)
        const previousIsBookmarked = isBookmarked
        const previousBookmarkCount = bookmarkCount

        // Optimistic update
        setIsBookmarked(!isBookmarked)
        setBookmarkCount(previousIsBookmarked ? bookmarkCount - 1 : bookmarkCount + 1)

        if (previousIsBookmarked) {
            const { success, error } = await unbookmarkRecipe(recipeId)
            if (!success) {
                setIsBookmarked(previousIsBookmarked)
                setBookmarkCount(previousBookmarkCount)
                return { success: false, error }
            }
        } else {
            const { success, error } = await bookmarkRecipe(recipeId)
            if (!success) {
                setIsBookmarked(previousIsBookmarked)
                setBookmarkCount(previousBookmarkCount)

                if (error?.code == 401) {
                    return {
                        success: false,
                        error: { message: "Authentication required", code: 401 },
                    }
                }
                return { success: false, error }
            }
        }

        // After successful action, revalidate the bookmarked recipes list
        mutateBookmarkedRecipes()
        setIsLoading(false)
        return { success: true }
    }

    const handleAuthRequired = () => {
        redirect("/signup")
    }

    // Bookmark Icon with proper styling
    const bookmarkIcon = (
        <BookmarkIcon
            className={
                isBookmarked
                    ? theme === "dark"
                        ? "fill-white text-white"
                        : "fill-gray-800 text-gray-800"
                    : theme === "dark"
                      ? "fill-none text-white"
                      : "fill-none text-gray-600"
            }
        />
    )

    return (
        <ActionButton
            size={size}
            iconSize={iconSize}
            isActive={isBookmarked}
            count={bookmarkCount}
            isLoading={isLoading}
            onToggle={handleToggle}
            onAuthRequired={handleAuthRequired}
            icon={bookmarkIcon}
            showCount={showCount}
            className={className}
            theme={theme}
            zeroText="Opslaan"
            activeLabel="Verwijder uit favorieten"
            inactiveLabel="Voeg toe aan favorieten"
            dataTestId="bookmark-recipe-button"
        />
    )
}
