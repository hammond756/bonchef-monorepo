"use client"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideInOverlay } from "@/components/ui/slide-in-overlay"
import { CommentList } from "@/components/comment-list"
import { CommentInput } from "@/components/comment-input"
import { Recipe } from "@/lib/types"
import { useComments } from "@/hooks/use-comments"
import { toast } from "@/hooks/use-toast"

interface CommentOverlayProps {
    isOpen: boolean
    onClose: () => void
    recipe: Recipe
}

export function CommentOverlay({ isOpen, onClose, recipe }: Readonly<CommentOverlayProps>) {
    const { comments, add, remove, isLoading, error } = useComments(recipe.id)
    const commentsContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (commentsContainerRef.current && isOpen) {
            requestAnimationFrame(() => {
                if (commentsContainerRef.current) {
                    commentsContainerRef.current.scrollTop = 0
                }
            })
        }
    }, [isOpen, comments])

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
                        comments={comments}
                        isLoading={isLoading}
                        error={error}
                        onDeleteComment={(commentId) => {
                            remove(commentId)
                            toast({
                                title: "Reactie verwijderd",
                                description: "Je reactie is succesvol verwijderd",
                            })
                        }}
                    />
                </div>

                {/* Comment Input */}
                <div className="border-t p-4">
                    <CommentInput onAddComment={add} />
                </div>
            </div>
        </SlideInOverlay>
    )
}
