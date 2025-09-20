"use server"

import { headers } from "next/headers"
import { processJobInBackground } from "@/lib/orchestration/recipe-import-jobs"
import { OnboardingService } from "@/lib/services/onboarding-service"
import {
    completeJobWithClient,
    createJobWithClient,
    failJobWithClient,
} from "@/lib/services/recipe-imports-job/shared"
import { createDraftRecipeWithClient } from "@/lib/services/recipes/shared"
import { getServerBaseUrl } from "@/lib/utils"
import { createAdminClient, createClient } from "@/utils/supabase/server"

async function startRecipeImportJobForOnboarding(
    sourceType: "url" | "image" | "text" | "vertical_video" | "dishcovery",
    sourceData: string,
    onboardingSessionId: string
) {
    const userId = process.env.NEXT_PUBLIC_MARKETING_USER_ID

    if (!userId) {
        throw new Error("NEXT_PUBLIC_MARKETING_USER_ID is not set")
    }

    const supabaseAdminClient = await createAdminClient()
    const onboardingService = new OnboardingService(supabaseAdminClient)

    const {
        success,
        error,
        data: job,
    } = await createJobWithClient(supabaseAdminClient, sourceType, sourceData, userId)

    if (!success) {
        throw new Error(error)
    }

    const { success: jobAssociationSuccess, error: jobAssociationError } =
        await onboardingService.createJobAssociation(onboardingSessionId, job.id)

    if (!jobAssociationSuccess) {
        throw new Error(jobAssociationError)
    }

    processJobInBackground(job)
        .then(async (recipe) => {
            const { id: savedRecipeId } = await createDraftRecipeWithClient(
                supabaseAdminClient,
                userId,
                {
                    ...recipe,
                    created_at: job.created_at,
                }
            )
            await onboardingService.createRecipeAssociation(onboardingSessionId, savedRecipeId)
            await completeJobWithClient(supabaseAdminClient, job.id, savedRecipeId)
        })
        .catch(async (error) => {
            console.error(`Failed to process job with id ${job.id}:`, error)
            await failJobWithClient(supabaseAdminClient, job.id, error.message)
        })

    return job.id
}

export async function startRecipeImportJob(
    sourceType: "url" | "image" | "text" | "vertical_video" | "dishcovery",
    sourceData: string,
    onboardingSessionId?: string
) {
    if (onboardingSessionId) {
        return startRecipeImportJobForOnboarding(sourceType, sourceData, onboardingSessionId)
    }
    const supabase = await createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()
    const baseUrl = getServerBaseUrl(await headers())
    const response = await fetch(`${baseUrl}/api/trigger-import-job`, {
        method: "POST",
        body: JSON.stringify({
            sourceType,
            sourceData,
        }),
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    })

    if (!response.ok) {
        console.error(response.statusText)
        throw new Error(response.statusText)
    }

    const { jobId } = await response.json()
    return jobId
}
