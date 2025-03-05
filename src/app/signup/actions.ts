"use server"

import { createClient } from "@/utils/supabase/server"

export async function signup(email: string, password: string, displayName: string) {
    try {
        
        const supabase = await createClient()
    
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        })
    
        if (signUpError) {
          console.error('Error signing up:', signUpError)
          return { error: signUpError.message }
        }
    
        if (!authData.user) {
            console.log(authData)
          return { error: "Er is iets misgegaan bij het aanmaken van je account" }
        }
    
        // Update the profile with display name
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', authData.user.id)
    
        if (updateError) {
          console.error('Error updating profile:', updateError)
          // We don't return here as the account is created, just log the error
        }
    
        // Sign in the user automatically
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
    
        if (signInError) {
          return { error: signInError.message }
        }

        return { success: "Je account is succesvol aangemaakt" }
      } catch (error) {
        console.error('Error signing up:', error)
        return { error: "Er is iets misgegaan bij het aanmaken van je account" }
      }
    }