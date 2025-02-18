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