import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createClient()

    // Get current user
    const {
        data: { user: _user },
    } = await supabase.auth.getUser()

    const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .select(
            `
      *,
      profiles!recipes_user_id_fkey(display_name, id, avatar),
      recipe_bookmarks(count),
      is_bookmarked_by_current_user
    `
        )
        .eq("id", id)
        .single()

    if (recipeError) {
        console.log("recipeError", recipeError)
        if (recipeError.code === "PGRST116") {
            console.log("Recipe not found or not accessible")
            return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
        }

        return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 })
    }

    // Add like count to recipe object
    const recipeWithBookmarks = {
        ...recipe,
        bookmark_count: recipe.recipe_bookmarks?.[0]?.count || 0,
    }

    return NextResponse.json({ recipe: recipeWithBookmarks })
}
