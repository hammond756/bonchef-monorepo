"use client"

import { BookmarkIcon } from "lucide-react"
import { ActionButton } from "@/components/recipe/action-button"
import { useBookmarkStatus } from "@/hooks/use-bookmark-status"
import { redirect } from "next/navigation"
import { useBookmarkCount } from "@/hooks/use-bookmark-count"

interface BookmarkButtonProps {
    recipeId: string
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
    showCount = true,
    className,
    theme,
}: BookmarkButtonProps) {
    const { isBookmarked, toggle, isLoading } = useBookmarkStatus(recipeId)
    const { bookmarkCount, mutate: mutateBookmarkCount } = useBookmarkCount(recipeId)

    const handleToggle = async () => {
        try {
            await toggle()
            await mutateBookmarkCount()
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : "Er is iets misgegaan",
                    code:
                        error instanceof Error && error.message === "Authentication required"
                            ? 401
                            : 500,
                },
            }
        }
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
            count={bookmarkCount || 0}
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
