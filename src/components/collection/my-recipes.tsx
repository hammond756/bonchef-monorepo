import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"
import { useMemo } from "react"
import { RecipePageSkeleton } from "./recipe-page-skeleton"
import { RecipeGrid } from "./recipe-grid"
import { RecipeList } from "./recipe-list"
import { WelcomeSection } from "./welcome-section"

export function MyRecipes({
    viewMode,
    sortOrder,
}: {
    viewMode: "grid" | "list"
    sortOrder: "newest" | "oldest"
}) {
    const { recipes: userRecipes, isLoading: userRecipesLoading } = useOwnRecipes()
    const { jobs: importJobs, isLoading: importJobsLoading } = useRecipeImportJobs()

    const myRecipesAndJobs = useMemo(() => {
        // Failed jobs first, then pending jobs, then recipes
        const failedJobs = importJobs
            .filter((job) => job.status === "failed")
            .map((job) => ({ ...job, viewType: "JOB" as const }))

        const pendingJobs = importJobs
            .filter((job) => job.status === "pending")
            .map((job) => ({ ...job, viewType: "JOB" as const }))

        const recipes = userRecipes.map((recipe) => ({ ...recipe, viewType: "RECIPE" as const }))

        const allCards = [...failedJobs, ...pendingJobs, ...recipes]

        return allCards.sort((a, b) => {
            const dateA = new Date(a.created_at ?? 0).getTime()
            const dateB = new Date(b.created_at ?? 0).getTime()
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB
        })
    }, [importJobs, userRecipes, sortOrder])

    if (userRecipesLoading || importJobsLoading) {
        return <RecipePageSkeleton />
    }

    if (myRecipesAndJobs.length === 0) {
        return <WelcomeSection />
    }

    if (viewMode === "grid") {
        return <RecipeGrid items={myRecipesAndJobs} />
    }

    return <RecipeList items={myRecipesAndJobs} />
}
