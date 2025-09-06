import { RecipeRead, RecipeImportJob } from "@/lib/types"
import { RecipeCard } from "@/components/recipe/recipe-card"
import { PendingJob } from "@/components/recipe/pending-job"
import { FailedJob } from "@/components/recipe/failed-job"

// A union type for items that can be displayed in the collection grid
export type CollectionItem =
    | (RecipeRead & { viewType: "RECIPE" })
    | (RecipeImportJob & { viewType: "JOB" })

interface RecipeGridProps {
    items: Readonly<CollectionItem[]>
}

/**
 * Renders a grid of recipe cards and job items
 */
export function RecipeGrid({ items }: RecipeGridProps) {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {items.map((item) =>
                item.viewType === "RECIPE" ? (
                    <RecipeCard key={item.id} recipe={item} />
                ) : item.status === "failed" ? (
                    <FailedJob key={item.id} job={item} />
                ) : (
                    <PendingJob key={item.id} job={item} />
                )
            )}
        </div>
    )
}
