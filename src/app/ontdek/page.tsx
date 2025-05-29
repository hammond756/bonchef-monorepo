import { Suspense } from "react"
import { PublicRecipeTimeline } from "@/components/public-recipe-timeline"
import { PublicRecipeTimelineSkeleton } from "@/components/public-recipe-timeline-skeleton"

export const revalidate = 300; // 5 minutes in seconds
export const dynamic = "force-static";

export default async function OntdekPage() {
  return (
    <div className="flex flex-1 flex-col" >
      <div className="px-4 py-8 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Community</h1>
      </div>
      
      <Suspense fallback={<PublicRecipeTimelineSkeleton />}>
        <PublicRecipeTimeline />
      </Suspense>
    </div>
  )
} 