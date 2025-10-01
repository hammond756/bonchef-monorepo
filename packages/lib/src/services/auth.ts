import type { SupabaseClient } from "@supabase/supabase-js"


export const login = async (supabase: SupabaseClient, email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw error
    }
}


export const signup = async (supabase: SupabaseClient, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        throw error
    }
}


export const loginWithGoogle = async (supabase: SupabaseClient) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
    })

    if (error) {
        throw error
    }

    return data
}


export const logout = async (supabase: SupabaseClient) => {
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw error
    }
}
