"use client"

import { CommentItem } from "@/components/comment-item"
import { Loader2 } from "lucide-react"
import { Comment } from "@/lib/types"

interface CommentListProps {
    comments: Comment[]
    isLoading: boolean
    error: unknown
    onDeleteComment: (commentId: string) => void
}

export function CommentList({
    comments,
    isLoading,
    error,
    onDeleteComment,
}: Readonly<CommentListProps>) {
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
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDelete={() => onDeleteComment(comment.id)}
                />
            ))}
        </div>
    )
}
