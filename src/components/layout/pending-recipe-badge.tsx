import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { NotificationBadge } from "../ui/notification-badge"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"
import { useProfile } from "@/hooks/use-profile"

export function PendingRecipeBadge() {
    const { profile } = useProfile()
    const { recipes } = useOwnRecipes({ enabled: !!profile })
    const { jobs } = useRecipeImportJobs({ enabled: !!profile })

    const pendingJobs = jobs.filter((job) => job.status === "pending")
    const pendingRecipes = recipes.filter((recipe) => recipe.status === "DRAFT")
    return <NotificationBadge totalCount={pendingJobs.length + pendingRecipes.length} />
}
