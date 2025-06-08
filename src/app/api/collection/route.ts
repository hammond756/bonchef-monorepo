import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error(error)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error: recipeError } = await supabase
        .from("recipe_creation_prototype")
        .select("*, is_liked_by_current_user, recipe_likes(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    if (recipeError) {
        console.error(recipeError)
        return NextResponse.json({ error: recipeError.message }, { status: 500 })
    }

    data.forEach(recipe => {
        recipe.like_count = recipe.recipe_likes?.[0]?.count || 0
    })
    return NextResponse.json(data)
}
