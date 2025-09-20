import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function getUserFromAuthHeader(request: NextRequest) {
    const authHeader = request.headers.get("Authorization")
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null
    if (accessToken) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
            }
        )
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user) return null
        return data.user
    }
}

export async function getUserFromRequest(request: NextRequest, response: NextResponse) {
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get("Authorization")
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null

    if (accessToken) {
        const user = await getUserFromAuthHeader(request)
        return { user, response }
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return { user, response }
}
