"use client"

import { useState, Suspense } from "react"
import { useQueryState } from "nuqs"
import { LayoutGrid, List } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AppTabsList } from "@/components/ui/app-tabs"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { cn } from "@/lib/utils"
import { NavigationTracker } from "@/components/util/navigation-tracker"
import { RecipeGridSkeleton } from "@/components/collection/recipe-grid-skeleton"
import { MyRecipes } from "@/components/collection/my-recipes"
import { FavoritesTabContent } from "@/components/collection/favorites-tab-content"

function CollectionContent() {
    const [activeTab, setActiveTab] = useQueryState("tab", {
        defaultValue: "my-recipes",
    })
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const { isVisible, scrollDirection } = useNavigationVisibility()

    const collectionTabs = [
        { value: "my-recipes", label: "Mijn recepten" },
        { value: "favorieten", label: "Mijn favorieten" },
    ]

    return (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <div
                // this element should translate together with the main navigation for the best
                // experience.
                className={cn(
                    "bg-surface sticky top-0 z-10 transition-transform duration-300 ease-in-out",
                    {
                        "translate-y-0": !isVisible || (isVisible && !scrollDirection),
                        "translate-y-[56px]": isVisible && scrollDirection,
                    }
                )}
            >
                <div className="pt-6 pb-2">
                    <div className="flex items-center justify-between px-4">
                        <AppTabsList tabs={collectionTabs} className="w-auto flex-grow" />
                    </div>
                </div>
                <div className="from-surface pointer-events-none h-2 bg-gradient-to-b to-transparent" />
            </div>

            <div className="px-4 pt-4 pb-10">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <Select
                        value={sortOrder}
                        onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
                    >
                        <SelectTrigger className="bg-status-green-bg text-status-green-text hover:bg-status-green-bg/80 border-status-green-bg w-[110px] border text-xs font-medium transition-colors focus:ring-0 focus:ring-offset-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Nieuwste</SelectItem>
                            <SelectItem value="oldest">Oudste</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="border-border bg-background flex rounded-lg border p-0.5">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`rounded-md p-1.5 transition-colors ${
                                viewMode === "grid"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`rounded-md p-1.5 transition-colors ${
                                viewMode === "list"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <TabsContent value="my-recipes" className="mt-0">
                    <MyRecipes viewMode={viewMode} sortOrder={sortOrder} />
                </TabsContent>
                <TabsContent value="favorieten" className="mt-0">
                    <FavoritesTabContent viewMode={viewMode} sortOrder={sortOrder} />
                </TabsContent>
            </div>
        </Tabs>
    )
}

export default function CollectionPage() {
    return (
        <>
            <NavigationTracker path="/collection" />
            <Suspense fallback={<RecipeGridSkeleton />}>
                <CollectionContent />
            </Suspense>
        </>
    )
}
