import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton loader for the recipe page
 */
export function RecipePageSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl px-4 pt-4 pb-10">
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <Skeleton className="aspect-[3/4] w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
