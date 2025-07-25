"use client"

import React, { forwardRef, useImperativeHandle, useState } from "react"
import { ActionButton } from "@/components/recipe/action-button"
import { useToast } from "@/hooks/use-toast"
import { redirect } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { useCommentCount } from "@/hooks/use-comment-count"

export interface CommentButtonProps {
    recipeId: string
    initialCommentCount: number
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg" | "xl"
    iconSize?: "sm" | "md" | "lg" | "xl"
    enabled?: boolean
    onCommentClick?: () => void
}

export interface CommentButtonRef {
    incrementCount: () => void
    decrementCount: () => void
}

export const CommentButton = forwardRef<CommentButtonRef, CommentButtonProps>(
    (
        {
            size,
            iconSize,
            recipeId,
            initialCommentCount,
            showCount = true,
            className,
            theme,
            onCommentClick,
        },
        ref
    ) => {
        const { commentCount, incrementCount, decrementCount } = useCommentCount(
            recipeId,
            initialCommentCount
        )
        const { toast } = useToast()
        const [isLoading, setIsLoading] = useState(false)

        const handleCommentClick = async () => {
            setIsLoading(true)
            try {
                // Call the parent's onCommentClick handler if provided
                if (onCommentClick) {
                    onCommentClick()
                }

                return { success: true }
            } catch (error) {
                return {
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : "Unknown error",
                        code: error instanceof Error && "cause" in error ? error.cause : undefined,
                    },
                }
            } finally {
                setIsLoading(false)
            }
        }

        const handleAuthRequired = () => {
            toast({
                title: "Welkom!",
                description: "Om te kunnen reageren kan je een gratis account aanmaken",
            })
            redirect("/signup")
        }

        // Comment Icon
        const commentIcon = (
            <MessageCircle
                size={iconSize === "sm" ? 14 : iconSize === "md" ? 16 : iconSize === "lg" ? 20 : 24}
                className={`transition-colors duration-200 ${
                    theme === "dark" ? "text-white opacity-80" : "text-gray-700"
                }`}
            />
        )

        // Expose increment/decrement functions for parent components
        useImperativeHandle(
            ref,
            () => ({
                incrementCount,
                decrementCount,
            }),
            [incrementCount, decrementCount]
        )

        return (
            <ActionButton
                size={size}
                iconSize={iconSize}
                isActive={false} // Comments don't have an active state like likes
                count={commentCount}
                isLoading={isLoading}
                onToggle={handleCommentClick}
                onAuthRequired={handleAuthRequired}
                icon={commentIcon}
                showCount={showCount}
                className={className}
                theme={theme}
                zeroText="Reageer"
                activeLabel="Bekijk reacties"
                inactiveLabel="Bekijk reacties"
                dataTestId="comment-recipe-button"
            />
        )
    }
)

CommentButton.displayName = "CommentButton"
