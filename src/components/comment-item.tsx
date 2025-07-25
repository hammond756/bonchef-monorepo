"use client"

import { Comment } from "@/lib/types"
import { ProfileImage } from "@/components/ui/profile-image"
import { formatRelativeTime } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useCommentActions } from "@/hooks/use-comment-actions"

interface CommentItemProps {
    comment: Comment
    onDelete?: () => void
}

export function CommentItem({ comment, onDelete }: Readonly<CommentItemProps>) {
    const { user } = useUser()
    const { deleteComment, isDeleting } = useCommentActions()

    const isOwnComment = user?.id === comment.user_id

    const handleDelete = async () => {
        if (!isOwnComment) return

        const success = await deleteComment(comment.id)
        if (success) {
            onDelete?.()
        }
    }

    return (
        <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <ProfileImage
                    src={comment.profiles.avatar}
                    name={comment.profiles.display_name}
                    size={32}
                />
            </div>

            {/* Comment Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {comment.profiles.display_name || "Anoniem"}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatRelativeTime(comment.created_at)}
                        </span>
                    </div>

                    {isOwnComment && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <p className="mt-1 text-sm leading-relaxed text-gray-700">{comment.text}</p>
            </div>
        </div>
    )
}
