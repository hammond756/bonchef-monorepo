import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "12")
        const queryParam = searchParams.get("q")

        const supabase = await createClient()

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase
            .from("recipe_creation_prototype")
            .select(
                `
        *,
        profiles(display_name, id, avatar),
        is_liked_by_current_user,
        recipe_likes(count)
      `,
                { count: "exact" }
            )
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .range(from, to)

        if (queryParam) {
            query = query.or(`title.ilike.%${queryParam}%,description.ilike.%${queryParam}%`)
        }

        if (process.env.NEXT_PUBLIC_MARKETING_USER_ID) {
            query = query.neq("user_id", process.env.NEXT_PUBLIC_MARKETING_USER_ID)
        }

        const { data, error, count } = await query

        if (error) {
            console.error("Error fetching public recipes:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const recipesWithLikes = data.map((recipe) => ({
            ...recipe,
            like_count: recipe.recipe_likes?.[0]?.count || 0,
        }))

        return NextResponse.json({ data: recipesWithLikes, count })
    } catch (error) {
        console.error("Error in recipes API route:", error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
