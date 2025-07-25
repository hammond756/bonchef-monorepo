import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Comment } from "@/lib/types"

interface UseCommentActionsReturn {
    createComment: (recipeId: string, text: string) => Promise<Comment | null>
    deleteComment: (commentId: string) => Promise<boolean>
    isCreating: boolean
    isDeleting: boolean
}

/**
 * Hook for comment creation and deletion operations
 */
export function useCommentActions(): UseCommentActionsReturn {
    const { toast } = useToast()
    const [isCreating, setIsCreating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const createComment = async (recipeId: string, text: string): Promise<Comment | null> => {
        setIsCreating(true)
        try {
            const response = await fetch(`/api/recipes/${recipeId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: text.trim() }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create comment")
            }

            const comment = await response.json()
            return comment
        } catch (error) {
            toast({
                title: "Fout",
                description: "Er is iets misgegaan bij het plaatsen van je reactie",
                variant: "destructive",
            })
            console.error("Error creating comment:", error)
            return null
        } finally {
            setIsCreating(false)
        }
    }

    const deleteComment = async (commentId: string): Promise<boolean> => {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete comment")
            }

            toast({
                title: "Reactie verwijderd",
                description: "Je reactie is succesvol verwijderd",
            })
            return true
        } catch (error) {
            toast({
                title: "Fout",
                description: "Er is iets misgegaan bij het verwijderen van je reactie",
                variant: "destructive",
            })
            console.error("Error deleting comment:", error)
            return false
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        createComment,
        deleteComment,
        isCreating,
        isDeleting,
    }
}
