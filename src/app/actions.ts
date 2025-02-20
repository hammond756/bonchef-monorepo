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

export async function getRecipes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("recipe_creation_prototype")
    .select("*")
    .eq("user_id", user?.id)
  return data
}