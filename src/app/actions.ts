"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logout() {
  const cookieStore = cookies()
  const supabase = await createClient()

  await supabase.auth.signOut()
  redirect("/login")
} 

export async function getRecipes(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipe_creation_prototype")
    .select("*")
    .eq("user_id", userId)
  return data
}

export async function getPublicRecipes(page = 1, pageSize = 10) {
  const supabase = await createClient()
  
  // Calculate pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Fetch public recipes with profiles join
  const { data, error, count } = await supabase
    .from("recipe_creation_prototype")
    .select("*, profiles!recipe_creation_prototype_user_id_fkey(display_name)", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(from, to)
  
  if (error) {
    console.error("Error fetching public recipes:", error)
    return { data: [], count: 0 }
  }
  
  return { data, count }
}