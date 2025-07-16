"use client"

import { useState, Suspense, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RecipeRead, RecipeImportJob } from "@/lib/types"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AppTabsList } from "@/components/ui/app-tabs"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"
import { useQueryState } from "nuqs"
import { LayoutGrid, List } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import React from "react"
import { RecipeCard, InProgressRecipeCard } from "@/components/recipe/recipe-card"
import { NavigationTracker } from "@/components/util/navigation-tracker"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import { cn } from "@/lib/utils"
import { InProgressRecipeListItem, RecipeListItem } from "@/components/recipe/recipe-list-item"

// A union type for items that can be displayed in the collection grid/list
type CollectionItem =
    | (RecipeRead & { viewType: "RECIPE" })
    | (RecipeImportJob & { viewType: "JOB" })

function RecipeGrid({ items }: { items: Readonly<CollectionItem>[] }) {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((item) =>
                item.viewType === "RECIPE" ? (
                    <RecipeCard key={item.id} recipe={item} />
                ) : (
                    <InProgressRecipeCard key={item.id} job={item} />
                )
            )}
        </div>
    )
}

function RecipeList({ items }: { items: Readonly<CollectionItem>[] }) {
    if (!items || items.length === 0) {
        return null
    }
    return (
        <div className="grid grid-cols-1 gap-4">
            {items.map((item) =>
                item.viewType === "RECIPE" ? (
                    <RecipeListItem key={item.id} recipe={item} />
                ) : (
                    <InProgressRecipeListItem key={item.id} job={item} />
                )
            )}
        </div>
    )
}

function WelcomeSection() {
    return (
        <div className="py-10 text-center">
            <h2 className="mb-2 text-xl font-bold">Welkom bij jouw kookboek!</h2>
            <p className="text-muted-foreground mb-4">
                Hier vind je al jouw recepten en favorieten op één plek.
            </p>
            <Button asChild>
                <Link href="/import">Voeg je eerste recept toe</Link>
            </Button>
        </div>
    )
}

function FavoritesCTA() {
    return (
        <div className="py-10 text-center">
            <h2 className="mb-2 text-xl font-bold">Nog geen favorieten</h2>
            <p className="text-muted-foreground mb-4">
                Ontdek nieuwe recepten en sla ze op als favoriet.
            </p>
            <Button asChild>
                <Link href="/ontdek">Ontdek recepten</Link>
            </Button>
        </div>
    )
}

function RecipePageSkeleton() {
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

function RecipesSection() {
    const { recipes: userRecipes, isLoading: userRecipesLoading } = useOwnRecipes()
    const { recipes: likedRecipes, isLoading: likedRecipesLoading } = useLikedRecipes()
    const { jobs: importJobs, isLoading: importJobsLoading } = useRecipeImportJobs()

    const [activeTab, setActiveTab] = useQueryState("tab", {
        defaultValue: "my-recipes",
    })
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const { isVisible, scrollDirection } = useNavigationVisibility()

    const myRecipesAndJobs = useMemo(() => {
        const pendingJobs = importJobs
            .filter((job) => job.status === "pending")
            .map((job) => ({ ...job, viewType: "JOB" as const }))

        const recipes = userRecipes.map((recipe) => ({ ...recipe, viewType: "RECIPE" as const }))

        const allItems: CollectionItem[] = [...pendingJobs, ...recipes]

        // Sort all items based on their creation date
        allItems.sort((a, b) => {
            const dateA = new Date(a.created_at ?? 0).getTime()
            const dateB = new Date(b.created_at ?? 0).getTime()
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB
        })

        return allItems
    }, [importJobs, userRecipes, sortOrder])

    const sortedLikedRecipes = useMemo(() => {
        const sorted = [...(likedRecipes || [])]
        sorted.sort((a, b) => {
            const dateA = new Date(a.created_at ?? 0).getTime()
            const dateB = new Date(b.created_at ?? 0).getTime()
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB
        })
        return sorted.map((r) => ({ ...r, viewType: "RECIPE" as const }))
    }, [likedRecipes, sortOrder])

    const loadingLogic = (
        isLoading: boolean,
        data: Readonly<CollectionItem>[],
        emptyComponent: React.ReactNode
    ) => {
        if (isLoading) {
            return <RecipePageSkeleton />
        }
        if (data.length === 0) {
            return emptyComponent
        }
        if (viewMode === "grid") {
            return <RecipeGrid items={data} />
        }
        return <RecipeList items={data} />
    }

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
                    <div className="container mx-auto flex max-w-4xl items-center justify-between px-4">
                        <AppTabsList tabs={collectionTabs} className="w-auto flex-grow" />
                    </div>
                </div>
                <div className="from-surface pointer-events-none h-2 bg-gradient-to-b to-transparent" />
            </div>

            <div className="container mx-auto max-w-4xl px-4 pt-4 pb-10">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <Select
                        value={sortOrder}
                        onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
                    >
                        <SelectTrigger className="bg-status-yellow-bg text-status-yellow-text hover:bg-status-yellow-bg/80 border-status-yellow-bg w-[110px] border text-xs font-medium transition-colors focus:ring-0 focus:ring-offset-0">
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
                    {loadingLogic(
                        userRecipesLoading || importJobsLoading,
                        myRecipesAndJobs,
                        <WelcomeSection />
                    )}
                </TabsContent>
                <TabsContent value="favorieten" className="mt-0">
                    {loadingLogic(likedRecipesLoading, sortedLikedRecipes, <FavoritesCTA />)}
                </TabsContent>
            </div>
        </Tabs>
    )
}

function RecipeGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
            ))}
        </div>
    )
}

export default function CollectionPage() {
    return (
        <>
            <NavigationTracker path="/collection" />
            <Suspense fallback={<RecipeGridSkeleton />}>
                <RecipesSection />
            </Suspense>
        </>
    )
}
