import { NextRequest, NextResponse } from "next/server"
import { getCommentsForRecipe, createComment } from "@/lib/services/comment-service"
import { CreateCommentSchema } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: recipeId } = await params

        if (!recipeId) {
            return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 })
        }

        const result = await getCommentsForRecipe(recipeId)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json(result.data)
    } catch (error) {
        console.error("Error fetching comments:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: recipeId } = await params

        if (!recipeId) {
            return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 })
        }

        const body = await request.json()

        // Validate request body
        const validationResult = CreateCommentSchema.safeParse({
            ...body,
            recipe_id: recipeId,
        })

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: validationResult.error },
                { status: 400 }
            )
        }

        const result = await createComment(validationResult.data)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json(result.data, { status: 201 })
    } catch (error) {
        console.error("Error creating comment:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
