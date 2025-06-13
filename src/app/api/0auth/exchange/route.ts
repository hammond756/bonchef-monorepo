import { NextResponse } from "next/server"
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            console.error("0auth/exchange error", error)
        }
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BONCHEF_FRONTEND_HOST}/auth-callback`
        )
    }

    // return the user to an error page with instructions
    return Response.json({ error: "No code provided" }, { status: 400 })
}
