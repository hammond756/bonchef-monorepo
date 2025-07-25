import { NextRequest, NextResponse } from "next/server"
import { deleteComment } from "@/lib/services/comment-service"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: commentId } = await params

        if (!commentId) {
            return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
        }

        const result = await deleteComment(commentId)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting comment:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
