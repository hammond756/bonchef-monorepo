import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { NotificationBadge } from "../ui/notification-badge"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"
import { useUser } from "@/hooks/use-user"

export function PendingRecipeBadge() {
    const { user } = useUser()
    const { recipes } = useOwnRecipes({ enabled: !!user })
    const { jobs } = useRecipeImportJobs({ enabled: !!user })

    const pendingJobs = jobs.filter((job) => job.status === "pending")
    const pendingRecipes = recipes.filter((recipe) => recipe.status === "DRAFT")
    return <NotificationBadge totalCount={pendingJobs.length + pendingRecipes.length} />
}
