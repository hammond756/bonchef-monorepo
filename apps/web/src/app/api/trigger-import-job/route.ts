import { type NextRequest, NextResponse } from "next/server"

import { getUserFromAuthHeader } from "@/lib/auth-helper"
import { processJobInBackground } from "@/lib/orchestration/recipe-import-jobs"
import {
    completeJobWithClient,
    createJobWithClient,
    failJobWithClient,
} from "@/lib/services/recipe-imports-job/shared"
import { createDraftRecipeWithClient } from "@/lib/services/recipes/shared"
import { createAdminClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
    const user = await getUserFromAuthHeader(request)

    if (!user) {
        console.log("unauthorized in trigger-import-job", request.nextUrl.pathname)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { sourceType, sourceData } = body

        if (!sourceType || !sourceData) {
            return NextResponse.json(
                { error: "sourceType and sourceData are required" },
                { status: 400 }
            )
        }

        const supabaseAdminClient = await createAdminClient()

        const {
            success,
            error,
            data: job,
        } = await createJobWithClient(supabaseAdminClient, sourceType, sourceData, user.id)

        if (!success) {
            return NextResponse.json({ error: error }, { status: 500 })
        }

        // Don't await this, let it run in the background
        processJobInBackground(job)
            .then(async (recipe) => {
                console.log(`Successfully processed job with id ${job.id}`)
                const { id: recipeId } = await createDraftRecipeWithClient(
                    supabaseAdminClient,
                    user.id,
                    {
                        ...recipe,
                        created_at: job.created_at,
                    }
                )
                await completeJobWithClient(supabaseAdminClient, job.id, recipeId)
            })
            .catch(async (error) => {
                console.error(`Failed to process job with id ${job.id}:`, error)
                await failJobWithClient(supabaseAdminClient, job.id, error.message)
            })

        return NextResponse.json({ jobId: job.id })
    } catch (error) {
        console.error("Error in trigger-import-job API:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
