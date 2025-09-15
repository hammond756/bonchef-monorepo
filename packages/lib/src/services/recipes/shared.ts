import { SupabaseClient } from "@supabase/supabase-js"

export interface RecipeRead {
  id: string
  title: string
  description?: string
  thumbnail: string
  source_url: string
  source_name: string
  n_portions: number
  total_cook_time_minutes: number
  ingredients: Array<{
    name: string
    ingredients: Array<{
      quantity: {
        type: "range"
        low: number
        high: number
      }
      unit: string
      description: string
    }>
  }>
  instructions: string[]
  is_public: boolean
  user_id: string
  status?: "DRAFT" | "PUBLISHED"
  created_at?: string
  is_bookmarked_by_current_user?: boolean
  bookmark_count?: number
  is_liked_by_current_user?: boolean
  like_count?: number
  comment_count?: number
  profiles?: {
    display_name: string | null
    id: string
    avatar?: string | null
  }
}

/**
 * Fetches a single recipe by ID with all related data
 * @param client - Supabase client instance
 * @param recipeId - The recipe ID to fetch
 * @returns Promise<RecipeRead> - The recipe data
 * @throws Error if recipe not found or database error
 */
export async function getRecipeWithClient(
  client: SupabaseClient,
  recipeId: string
): Promise<RecipeRead> {
  const { data: recipe, error: recipeError } = await client
    .from("recipes")
    .select(
      `
      *,
      profiles!recipes_user_id_fkey(display_name, id, avatar),
      recipe_bookmarks(count),
      recipe_likes(count),
      is_bookmarked_by_current_user,
      is_liked_by_current_user
    `
    )
    .eq("id", recipeId)
    .single()

  if (recipeError) {
    if (recipeError.code === "PGRST116") {
      throw new Error("Recipe not found")
    }
    throw new Error(`Failed to fetch recipe: ${recipeError.message}`)
  }

  // Add bookmark and like counts to recipe object
  const recipeWithCounts: RecipeRead = {
    ...recipe,
    bookmark_count: recipe.recipe_bookmarks?.[0]?.count || 0,
    like_count: recipe.recipe_likes?.[0]?.count || 0,
  }

  return recipeWithCounts
}

/**
 * Fetches public recipes with pagination and search
 * @param client - Supabase client instance
 * @param options - Query options
 * @returns Promise<{data: RecipeRead[], count: number}> - Recipes and total count
 * @throws Error if database error
 */
export async function getPublicRecipesWithClient(
  client: SupabaseClient,
  options: {
    page?: number
    pageSize?: number
    query?: string
  } = {}
): Promise<{ data: RecipeRead[]; count: number }> {
  const { page = 1, pageSize = 12, query: searchQuery } = options

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from("recipes")
    .select(
      `
      *,
      profiles(display_name, id, avatar),
      is_bookmarked_by_current_user,
      is_liked_by_current_user,
      recipe_bookmarks(count),
      recipe_likes(count)
    `,
      { count: "exact" }
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`)
  }

  // Transform the counts
  const recipesWithCounts: RecipeRead[] = (data || []).map((recipe) => ({
    ...recipe,
    bookmark_count: recipe.recipe_bookmarks?.[0]?.count || 0,
    like_count: recipe.recipe_likes?.[0]?.count || 0,
  }))

  return { data: recipesWithCounts, count: count || 0 }
}

/**
 * Fetches user's own recipes
 * @param client - Supabase client instance
 * @param userId - The user ID to fetch recipes for
 * @returns Promise<RecipeRead[]> - User's recipes
 * @throws Error if database error
 */
export async function getUserRecipesWithClient(
  client: SupabaseClient,
  userId: string
): Promise<RecipeRead[]> {
  const { data, error } = await client
    .from("recipes")
    .select(
      `
      *,
      profiles(display_name, id, avatar),
      is_bookmarked_by_current_user,
      is_liked_by_current_user,
      recipe_bookmarks(count),
      recipe_likes(count)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user recipes: ${error.message}`)
  }

  // Transform the counts
  const recipesWithCounts: RecipeRead[] = (data || []).map((recipe) => ({
    ...recipe,
    bookmark_count: recipe.recipe_bookmarks?.[0]?.count || 0,
    like_count: recipe.recipe_likes?.[0]?.count || 0,
  }))

  return recipesWithCounts
}
