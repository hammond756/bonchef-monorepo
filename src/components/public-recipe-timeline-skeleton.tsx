import { Skeleton } from "@/components/ui/skeleton"

export function PublicRecipeTimelineSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg">
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            <div className="mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 