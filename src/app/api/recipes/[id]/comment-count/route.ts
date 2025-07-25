import { NextRequest, NextResponse } from "next/server"
import { getCommentCount } from "@/lib/services/comment-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const result = await getCommentCount(id)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ count: result.data })
    } catch (error) {
        console.error("Error fetching comment count:", error)
        return NextResponse.json({ error: "Failed to fetch comment count" }, { status: 500 })
    }
}
