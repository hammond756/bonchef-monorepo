import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { NotificationBadge } from "../ui/notification-badge"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"

export function PendingRecipeBadge() {
    const { recipes } = useOwnRecipes()
    const { jobs } = useRecipeImportJobs()

    const pendingJobs = jobs.filter((job) => job.status === "pending")
    const pendingRecipes = recipes.filter((recipe) => recipe.status === "DRAFT")
    return <NotificationBadge totalCount={pendingJobs.length + pendingRecipes.length} />
}
