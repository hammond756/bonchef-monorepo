import { createClient } from "@/utils/supabase/client"
import { listJobsWithClient, getJobByRecipeIdWithClient } from "./shared"

export const listJobs = (userId: string) => {
    const supabase = createClient()
    return listJobsWithClient(supabase, userId)
}

export const getJobByRecipeId = (recipeId: string) => {
    const supabase = createClient()
    return getJobByRecipeIdWithClient(supabase, recipeId)
}
