import { createClient } from "@/utils/supabase/client"
import { listJobsWithClient } from "./shared"

export const listJobs = (userId: string) => {
    const supabase = createClient()
    return listJobsWithClient(supabase, userId)
}
