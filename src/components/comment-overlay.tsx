"use client"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideInOverlay } from "@/components/ui/slide-in-overlay"
import { CommentList } from "@/components/comment-list"
import { CommentInput } from "@/components/comment-input"
import { Recipe } from "@/lib/types"

interface CommentOverlayProps {
    isOpen: boolean
    onClose: () => void
    recipe: Recipe
    onCommentAdded?: () => void
    onCommentDeleted?: () => void
    onCommentCountChange?: (increment: boolean) => void
}

export function CommentOverlay({
    isOpen,
    onClose,
    recipe,
    onCommentAdded,
    onCommentDeleted,
    onCommentCountChange,
}: Readonly<CommentOverlayProps>) {
    const commentsContainerRef = useRef<HTMLDivElement>(null)

    // Scroll to top when new comment is added (since newest comments are at top)
    useEffect(() => {
        if (commentsContainerRef.current && isOpen) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                if (commentsContainerRef.current) {
                    commentsContainerRef.current.scrollTop = 0
                }
            })
        }
    }, [isOpen])

    return (
        <SlideInOverlay isOpen={isOpen} onClose={onClose}>
            <div className="flex h-full max-h-[65vh] flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Reacties</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Sluit reacties"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Recipe Description */}
                {recipe.description && (
                    <div className="border-b p-4 text-center">
                        <p className="text-sm leading-relaxed text-gray-700">
                            {recipe.description}
                        </p>
                    </div>
                )}

                {/* Comments List */}
                <div
                    ref={commentsContainerRef}
                    className="min-h-0 flex-1 overflow-y-auto"
                    style={{ overscrollBehavior: "contain" }}
                >
                    <CommentList
                        recipeId={recipe.id}
                        onCommentCreated={() => {
                            // Notify parent about comment deletion
                            onCommentDeleted?.()
                            // Update comment count
                            onCommentCountChange?.(false)
                        }}
                    />
                </div>

                {/* Comment Input */}
                <div className="border-t p-4">
                    <CommentInput
                        recipeId={recipe.id}
                        onCommentCreated={() => {
                            // Trigger a refetch of comments after creating a new comment
                            // This will be handled by the CommentList component
                        }}
                        onCommentAdded={() => {
                            // Notify parent about comment addition
                            onCommentAdded?.()
                            // Update comment count
                            onCommentCountChange?.(true)
                        }}
                    />
                </div>
            </div>
        </SlideInOverlay>
    )
}
