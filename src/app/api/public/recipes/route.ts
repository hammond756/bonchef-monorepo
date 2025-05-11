import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const offset = parseInt(searchParams.get("offset") || "1")
    const pageSize = parseInt(searchParams.get("page_size") || "10")
    
    const supabase = await createClient()
    
    // Calculate pagination
    const from = (offset - 1) * pageSize
    const to = from + pageSize - 1
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch public recipes with profiles join and like status
    let query = supabase
      .from("recipe_creation_prototype")
      .select(`
        *,
        profiles(display_name, id, avatar),
        is_liked_by_current_user,
        recipe_likes(count)
      `, { count: "exact" })
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .range(from, to)
    
    if (process.env.NEXT_PUBLIC_MARKETING_USER_ID) {
      // Exclude recipes created by marketing user. These should be public
      // for the target audience, but we don't want to show them in the
      // public recipe timeline.
      query = query.neq("user_id", process.env.NEXT_PUBLIC_MARKETING_USER_ID)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error("Error fetching public recipes:", error)
      return NextResponse.json({ data: [], count: 0 }, { status: 500 })
    }
  
    // Add like counts to recipes
    const recipesWithLikes = data.map(recipe => ({
      ...recipe,
      like_count: recipe.recipe_likes?.[0]?.count || 0
    }))
  
    return NextResponse.json({ data: recipesWithLikes, count })
  } catch (error) {
    console.error("Error in recipes API route:", error)
    return NextResponse.json({ data: [], count: 0 }, { status: 500 })
  }
}
