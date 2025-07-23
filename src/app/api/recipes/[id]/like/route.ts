import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { RecipeLikeService } from "@/lib/services/recipe-like-service"

/**
 * Toggles like status for a recipe (like if not liked, unlike if already liked)
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params
        const recipeId = params.id

        if (!recipeId) {
            return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 })
        }

        const supabase = await createClient()

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        // Toggle like status
        const recipeLikeService = new RecipeLikeService(supabase)
        const result = await recipeLikeService.toggleLike(recipeId, user.id)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            isLiked: result.data.isLiked,
            likeCount: result.data.likeCount,
        })
    } catch (error) {
        console.error("Error in like API route:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
