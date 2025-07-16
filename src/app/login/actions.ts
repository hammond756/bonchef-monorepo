"use server"

import { getServerBaseUrl } from "@/lib/utils"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function login(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect("/auth-callback")
}

export async function createTemporaryUser() {
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
        return { error: signUpError.message }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (signInError) {
        return { error: signInError.message }
    }

    redirect("/auth-callback")
}

export async function loginWithGoogle(): Promise<{
    redirectUrl: string | null
    error: string | null
}> {
    const supabase = await createClient()
    const baseUrl = getServerBaseUrl(await headers())
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${baseUrl}/api/0auth/exchange`,
        },
    })

    if (error) {
        return { error: error.message, redirectUrl: null }
    }

    return { redirectUrl: data.url, error: null }
}
