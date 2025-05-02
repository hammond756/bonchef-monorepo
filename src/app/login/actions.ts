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
    redirect("/auth-callback")
  }

  return { error }
}

export async function createTemporaryUser() {
  const cookieStore = cookies()
  const supabase = await createClient()

  const uuid = crypto.randomUUID()
  const email = `tijdelijke-bezoeker-${uuid}@example.com`
  const password = Math.random().toString(36).slice(-8)

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (signUpError) {
    return { error: signUpError }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: signInError }
  }

  redirect("/auth-callback")
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BONCHEF_FRONTEND_HOST}/api/0auth/exchange`,
    },
  })
  if (data?.url) {
    redirect(data.url)
  }
  return { error }
}