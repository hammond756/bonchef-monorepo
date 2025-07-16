import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    const { data: jobs, error } = await supabase
        .from("recipe_import_jobs")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "completed")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Failed to fetch recipe import jobs:", error)
        return new NextResponse(JSON.stringify({ error: "Failed to fetch jobs" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }

    return NextResponse.json(jobs)
}
