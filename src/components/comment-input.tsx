"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileImage } from "@/components/ui/profile-image"
import { useProfile } from "@/hooks/use-profile"
import { useCommentActions } from "@/hooks/use-comment-actions"
import { useSession } from "@/hooks/use-session"

interface CommentInputProps {
    recipeId: string
    onCommentCreated?: () => void
    onCommentAdded?: () => void
}

export function CommentInput({
    recipeId,
    onCommentCreated,
    onCommentAdded,
}: Readonly<CommentInputProps>) {
    const { session } = useSession()
    const { profile } = useProfile()
    const { createComment, isCreating } = useCommentActions()
    const [text, setText] = useState("")

    const maxLength = 500
    const remainingChars = maxLength - text.length
    const canSubmit = text.trim().length > 0 && text.length <= maxLength && !isCreating

    const handleSubmit = async () => {
        if (!canSubmit || !session) return

        const comment = await createComment(recipeId, text.trim())
        if (comment) {
            setText("")
            onCommentCreated?.()
            onCommentAdded?.()
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    if (!session) {
        return (
            <div className="py-4 text-center">
                <p className="text-sm text-gray-500">Je moet ingelogd zijn om te kunnen reageren</p>
            </div>
        )
    }

    return (
        <div className="flex items-end space-x-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
                <ProfileImage src={profile?.avatar} name={profile?.display_name} size={32} />
            </div>

            {/* Input Field */}
            <div className="flex-1">
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Schrijf een reactie..."
                        className="focus:border-primary focus:ring-primary w-full resize-none rounded-lg border border-gray-300 p-3 pr-12 text-sm focus:ring-1 focus:outline-none"
                        rows={1}
                        maxLength={maxLength}
                        disabled={isCreating}
                        aria-label="Schrijf een reactie"
                        aria-describedby="comment-char-count"
                    />

                    {/* Character Count */}
                    <div className="absolute right-2 bottom-2">
                        <span
                            id="comment-char-count"
                            className={`text-xs ${
                                remainingChars < 50 ? "text-red-500" : "text-gray-400"
                            }`}
                            aria-live="polite"
                        >
                            {remainingChars}
                        </span>
                    </div>
                </div>
            </div>

            {/* Send Button */}
            <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                aria-label="Verstuur reactie"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    )
}
