import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json()
    
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
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Er is iets misgegaan bij het aanmaken van je account" },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: signInError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Je account is succesvol aangemaakt. Veel plezier met het koken!" },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Er is iets misgegaan bij het aanmaken van je account" },
      { status: 500 }
    )
  }
} 