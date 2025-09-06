"use client"

import { ActionButton } from "@/components/recipe/action-button"
import { useToast } from "@/hooks/use-toast"
import { redirect } from "next/navigation"
import { OkHandIcon } from "@/components/ui/ok-hand-icon"
import { useLikeStatus } from "@/hooks/use-like-status"
import { useLikeCount } from "@/hooks/use-like-count"

interface LikeButtonProps {
    recipeId: string
    initialLiked?: boolean
    initialLikeCount?: number
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg" | "xl"
    iconSize?: "sm" | "md" | "lg" | "xl"
    enabled?: boolean
}

export function LikeButton({
    size,
    iconSize,
    recipeId,
    initialLiked,
    initialLikeCount,
    showCount = true,
    className,
    theme,
}: LikeButtonProps) {
    const { isLiked, toggle, isLoading } = useLikeStatus(recipeId, initialLiked)
    const { likeCount, mutate: mutateLikeCount } = useLikeCount(recipeId, initialLikeCount)
    const { toast } = useToast()

    const handleToggle = async () => {
        try {
            await toggle()
            await mutateLikeCount()
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
        toast({
            title: "Welkom!",
            description: "Om recepten te liken kan je een gratis account aanmaken",
        })
        redirect("/signup")
    }

    // OK Hand Icon
    const likeIcon = (
        <OkHandIcon
            size={iconSize === "sm" ? 16 : iconSize === "md" ? 20 : iconSize === "lg" ? 24 : 28}
            isLiked={isLiked}
            theme={theme}
        />
    )

    return (
        <ActionButton
            size={size}
            iconSize={iconSize}
            isActive={isLiked}
            count={likeCount || 0}
            isLoading={isLoading}
            onToggle={handleToggle}
            onAuthRequired={handleAuthRequired}
            icon={likeIcon}
            showCount={showCount}
            className={className}
            theme={theme}
            zeroText="Bonchef"
            activeLabel="Unlike dit recept"
            inactiveLabel="Like dit recept"
            dataTestId="like-recipe-button"
        />
    )
}
