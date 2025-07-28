import useSWR from "swr"
import { getCommentsForRecipe, createComment, deleteComment } from "@/lib/services/comments/client"
import { Comment } from "@/lib/types"
import { useUser } from "./use-user"
import { useCommentCount } from "./use-comment-count"

export function useComments(recipeId: string) {
    const { user } = useUser()
    const { count, mutate: mutateCommentCount } = useCommentCount(recipeId)
    const {
        data: comments,
        error,
        mutate,
    } = useSWR(recipeId ? ["comments", recipeId] : null, () => getCommentsForRecipe(recipeId), {
        revalidateOnFocus: false,
    })

    const add = async (text: string) => {
        if (!user) return

        const optimisticComment: Comment = {
            id: crypto.randomUUID(),
            recipe_id: recipeId,
            user_id: user.id,
            text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile: {
                id: user.id,
                display_name: user.user_metadata.display_name,
                avatar: user.user_metadata.avatar,
            },
        }

        const mutation = async (currentData: Comment[] = []) => {
            const newComment = await createComment({ recipe_id: recipeId, text })
            console.log("[use-comments] add", newComment)
            mutateCommentCount(count + 1)
            return [newComment, ...currentData]
        }

        await mutate(mutation, {
            optimisticData: (currentData: Comment[] = []) => [optimisticComment, ...currentData],
            rollbackOnError: true,
            revalidate: false,
        })
    }

    const remove = async (commentId: string) => {
        const mutation = async (currentData: Comment[] = []) => {
            await deleteComment(commentId)
            mutateCommentCount(count - 1)
            return currentData.filter((c) => c.id !== commentId)
        }

        await mutate(mutation, {
            optimisticData: (currentData: Comment[] = []) =>
                currentData.filter((c) => c.id !== commentId),
            rollbackOnError: true,
            revalidate: false,
        })
    }

    return {
        comments: comments || [],
        isLoading: !comments && !error,
        error,
        add,
        remove,
    }
}
