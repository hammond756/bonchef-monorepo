"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(email: string, password: string) {
  const cookieStore = cookies()
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!error) {
    redirect("/")
  }

  return { error }
}