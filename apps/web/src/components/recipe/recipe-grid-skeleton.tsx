"use client"

import { Skeleton } from "../ui/skeleton"

export function RecipeGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="relative aspect-4/3 overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                </div>
            ))}
        </div>
    )
}
