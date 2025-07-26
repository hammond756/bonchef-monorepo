"use client"

import { useComments } from "@/hooks/use-comments"
import { CommentItem } from "@/components/comment-item"
import { Loader2 } from "lucide-react"

interface CommentListProps {
    recipeId: string
    onCommentCreated?: () => void
    onCommentDeleted?: () => void
}

export function CommentList({
    recipeId,
    onCommentCreated,
    onCommentDeleted,
}: Readonly<CommentListProps>) {
    const { comments, isLoading, error, mutate } = useComments({ recipeId })

    // Trigger mutate when onCommentCreated is called
    const _handleCommentCreated = () => {
        mutate() // Revalidate the data
        onCommentCreated?.()
    }

    // Trigger mutate when onCommentDeleted is called
    const handleCommentDeleted = () => {
        mutate() // Revalidate the data
        onCommentDeleted?.()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-sm text-gray-500">
                    Er is iets misgegaan bij het laden van de reacties
                </p>
            </div>
        )
    }

    if (comments.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-sm text-gray-500">Nog geen reacties</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 p-4">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onDelete={handleCommentDeleted} />
            ))}
        </div>
    )
}
