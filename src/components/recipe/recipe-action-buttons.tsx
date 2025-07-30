"use client"

import React, { forwardRef } from "react"
import Link from "next/link"
import { Recipe } from "@/lib/types"
import { BookmarkButton } from "@/components/bookmark-button"
import { LikeButton } from "@/components/like-button"
import { CommentButton } from "@/components/comment-button"
import { ProfileImage } from "@/components/ui/profile-image"
import { ShareRecipeButton } from "@/components/share-recipe-button"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { lightThemeClasses, darkThemeClasses } from "@/components/recipe/action-button-variants"

const profileLinkVariants = cva(
    "group/profile flex items-center justify-center rounded-full transition-colors duration-200",
    {
        variants: {
            theme: {
                light: lightThemeClasses,
                dark: darkThemeClasses,
            },
            size: {
                md: "h-10 w-10",
                lg: "h-12 w-12",
            },
        },
        defaultVariants: {
            theme: "light",
            size: "lg",
        },
    }
)

interface RecipeActionButtonsProps {
    recipe: Recipe
    theme?: "light" | "dark"
    size?: "md" | "lg"
    shareButtonSize?: "md" | "lg"
    bookmarkButtonSize?: "sm" | "md" | "lg"
    bookmarkButtonIconSize?: "sm" | "md" | "lg" | "xl"
    likeButtonSize?: "sm" | "md" | "lg" | "xl"
    likeButtonIconSize?: "sm" | "md" | "lg" | "xl"
    commentButtonSize?: "sm" | "md" | "lg" | "xl"
    commentButtonIconSize?: "sm" | "md" | "lg" | "xl"
    avatarSize?: "md" | "lg"
    onCommentClick?: () => void
}

export const RecipeActionButtons = forwardRef<HTMLDivElement, RecipeActionButtonsProps>(
    (
        {
            recipe,
            theme,
            size,
            shareButtonSize,
            bookmarkButtonSize,
            bookmarkButtonIconSize,
            likeButtonSize,
            likeButtonIconSize,
            commentButtonSize,
            commentButtonIconSize,
            avatarSize,
            onCommentClick,
        },
        ref
    ) => {
        const finalShareSize = shareButtonSize || size || "lg"
        const finalBookmarkSize = bookmarkButtonSize || size || "lg"
        const finalLikeSize = likeButtonSize || "md"
        const finalCommentSize = commentButtonSize || "md"
        const finalAvatarSize = avatarSize || size || "lg"
        const profileImageSize = finalAvatarSize === "lg" ? 48 : 40

        return (
            <div ref={ref} className="grid justify-items-center gap-y-2">
                <ShareRecipeButton
                    title={recipe.title}
                    text={`Bekijk dit recept: ${recipe.title}`}
                    theme={theme ?? "light"}
                    size={finalShareSize}
                />
                <LikeButton
                    size={finalLikeSize}
                    iconSize={likeButtonIconSize || "xl"}
                    theme={theme ?? "light"}
                    recipeId={recipe.id}
                    initialLiked={recipe.is_liked_by_current_user ?? false}
                    initialLikeCount={recipe.like_count || 0}
                />
                <CommentButton
                    size={finalCommentSize}
                    iconSize={commentButtonIconSize || "xl"}
                    theme={theme ?? "light"}
                    recipeId={recipe.id}
                    onCommentClick={onCommentClick}
                />
                <BookmarkButton
                    size={finalBookmarkSize}
                    iconSize={bookmarkButtonIconSize || "lg"}
                    theme={theme ?? "light"}
                    recipeId={recipe.id}
                />
                {recipe.profiles && (
                    <div className="flex flex-col items-center">
                        <Link
                            href={`/profiles/~${recipe.profiles.id}`}
                            className={cn(profileLinkVariants({ theme, size: finalAvatarSize }))}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ProfileImage
                                src={recipe.profiles.avatar}
                                name={recipe.profiles.display_name}
                                size={profileImageSize}
                            />
                        </Link>
                        <span className="text-xs">&nbsp;</span>
                    </div>
                )}
            </div>
        )
    }
)

RecipeActionButtons.displayName = "RecipeActionButtons"
