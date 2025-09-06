import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("recipes")
        .select(
            "*, is_bookmarked_by_current_user, is_liked_by_current_user, recipe_bookmarks(count), recipe_likes(count), profiles(display_name)"
        )
        .eq("is_bookmarked_by_current_user", true)

    if (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    data.forEach((recipe) => {
        recipe.bookmark_count = recipe.recipe_bookmarks?.[0]?.count || 0
        recipe.like_count = recipe.recipe_likes?.[0]?.count || 0
    })
    return NextResponse.json(data)
}
