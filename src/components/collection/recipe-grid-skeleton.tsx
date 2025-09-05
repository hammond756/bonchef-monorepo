import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton loader for the recipe grid
 */
export function RecipeGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
            ))}
        </div>
    )
}
