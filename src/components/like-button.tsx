"use client"

import { useState } from "react"
import { ActionButton } from "@/components/recipe/action-button"
import { useToast } from "@/hooks/use-toast"
import { redirect } from "next/navigation"
import { OkHandIcon } from "@/components/ui/ok-hand-icon"

interface LikeButtonProps {
    recipeId: string
    initialLiked: boolean
    initialLikeCount: number
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg" | "xl"
    iconSize?: "sm" | "md" | "lg" | "xl"
    enabled?: boolean
}

async function toggleLike(recipeId: string) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to toggle like")
        }

        return {
            success: true,
            isLiked: data.isLiked,
            likeCount: data.likeCount,
        }
    } catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : "Unknown error",
                code: error instanceof Error && "cause" in error ? error.cause : undefined,
            },
        }
    }
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
    const [isLiked, setIsLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleToggle = async () => {
        setIsLoading(true)
        const previousIsLiked = isLiked
        const previousLikeCount = likeCount

        // Optimistic update
        setIsLiked(!isLiked)
        setLikeCount(previousIsLiked ? likeCount - 1 : likeCount + 1)

        const result = await toggleLike(recipeId)

        if (!result.success) {
            // Revert optimistic update on error
            setIsLiked(previousIsLiked)
            setLikeCount(previousLikeCount)

            if (result.error?.code === 401) {
                toast({
                    title: "Welkom!",
                    description: "Om recepten te liken kan je een gratis account aanmaken",
                })
                redirect("/signup")
            }

            return result
        } else {
            // Update with actual values from server
            setIsLiked(result.isLiked)
            setLikeCount(result.likeCount)
        }

        setIsLoading(false)
        return { success: true }
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
            count={likeCount}
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
