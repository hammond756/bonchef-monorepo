import { createClient } from "@/utils/supabase/server"
import {
    assignJobsToUserWithClient,
    createJobWithClient,
    listJobsWithClient,
    getJobByRecipeIdWithClient,
} from "./shared"
import { z } from "zod"
import { RecipeImportSourceTypeEnum } from "@/lib/types"

export const listJobs = async (userId: string) => {
    const supabase = await createClient()
    return listJobsWithClient(supabase, userId)
}

export const createJob = async (
    sourceType: z.infer<typeof RecipeImportSourceTypeEnum>,
    sourceData: string,
    userId: string
) => {
    const supabase = await createClient()
    return createJobWithClient(supabase, sourceType, sourceData, userId)
}

export const getJobByRecipeId = async (recipeId: string) => {
    const supabase = await createClient()
    return getJobByRecipeIdWithClient(supabase, recipeId)
}

export const assignJobsToUser = async (jobIds: string[], userId: string) => {
    const supabase = await createClient()
    return assignJobsToUserWithClient(supabase, jobIds, userId)
}
