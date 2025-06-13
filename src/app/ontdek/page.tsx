import { Suspense } from "react"
import { PublicRecipeTimeline } from "@/components/public-recipe-timeline"
import { PublicRecipeTimelineSkeleton } from "@/components/public-recipe-timeline-skeleton"
import { SearchBar } from "@/components/ui/search-bar"

export default function OntdekPage() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 pt-6 pb-4">
                <Suspense>
                    <SearchBar placeholder="Zoek en druk op Enter..." />
                </Suspense>
            </div>

            <Suspense fallback={<PublicRecipeTimelineSkeleton />}>
                <PublicRecipeTimeline />
            </Suspense>
        </div>
    )
}
