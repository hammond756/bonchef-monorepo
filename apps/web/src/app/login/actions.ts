"use server"

import { getServerBaseUrl } from "@/lib/utils"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import * as authService from "@repo/lib/services/auth"

export async function login(email: string, password: string) {
    const supabase = await createClient()
    try {
        await authService.login(supabase, email, password)
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Er is iets misgegaan bij het inloggen." }
    }
    redirect("/auth-callback")
}

export async function createTemporaryUser() {
    const supabase = await createClient()

    const uuid = crypto.randomUUID()
    const email = `tijdelijke-bezoeker-${uuid}@example.com`
    const password = Math.random().toString(36).slice(-8)

    try {
        await authService.signup(supabase, email, password)
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Er is iets misgegaan bij het aanmaken van je account" }
    }

    try {
        await authService.login(supabase, email, password)
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Er is iets misgegaan bij het inloggen" }
    }
}

export async function loginWithGoogle(): Promise<{
    redirectUrl: string | null
    error: string | null
}> {
    const supabase = await createClient()
    const baseUrl = getServerBaseUrl(await headers())
    
    try {
        const data = await authService.loginWithGoogle(supabase)
        return { redirectUrl: data.url, error: null }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Er is iets misgegaan bij het inloggen met Google", redirectUrl: null }
    }
}
