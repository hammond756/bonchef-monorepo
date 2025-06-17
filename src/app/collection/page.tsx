"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RecipeRead } from "@/lib/types"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AppTabsList } from "@/components/ui/app-tabs"
import { LikeButton } from "@/components/like-button"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useQueryState } from "nuqs"
import { LayoutGrid, List } from "lucide-react"
import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import React from "react"

function RecipeGrid({ recipes, activeTab }: { recipes: RecipeRead[]; activeTab: string }) {
    if (!recipes || recipes.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {recipes.map((recipe) => {
                let chefDisplayGridString: string | null = null

                if (activeTab === "favorieten") {
                    chefDisplayGridString = recipe.profiles.display_name ?? "Auteur onbekend"
                }

                const timeAndDifficultyParts: string[] = []

                if (
                    recipe.total_cook_time_minutes !== undefined &&
                    recipe.total_cook_time_minutes > 0
                ) {
                    timeAndDifficultyParts.push(`${recipe.total_cook_time_minutes} min`)
                    timeAndDifficultyParts.push("Medium")
                }

                return (
                    <div
                        key={recipe.id}
                        className="group flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md"
                    >
                        <Link
                            href={`/recipes/${recipe.id}`}
                            className="flex w-full flex-grow flex-col"
                        >
                            <div className="relative aspect-[3/4] w-full">
                                <Image
                                    src={recipe.thumbnail}
                                    alt={recipe.title}
                                    fill
                                    className="rounded-t-lg object-cover transition-transform group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                                />
                                <div className="absolute top-2 right-2 z-10">
                                    <LikeButton
                                        buttonSize="sm"
                                        recipeId={recipe.id}
                                        initialLiked={recipe.is_liked_by_current_user}
                                        initialLikeCount={recipe.like_count}
                                        showCount={false}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-grow flex-col justify-between bg-white p-3">
                                <div>
                                    <h2 className="text-bonchef-dark mb-0.5 line-clamp-2 h-10 font-['Montserrat'] text-[15px] leading-5 font-semibold">
                                        {recipe.title}
                                    </h2>
                                    <div className="mt-1 font-['Montserrat'] text-[10px] text-gray-500">
                                        {timeAndDifficultyParts.length > 0 && (
                                            <div className="line-clamp-1">
                                                {timeAndDifficultyParts.join(" · ")}
                                            </div>
                                        )}
                                        {chefDisplayGridString && (
                                            <div className="line-clamp-1">
                                                door {chefDisplayGridString}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}

function RecipeListItem({ recipe, activeTab }: { recipe: RecipeRead; activeTab: string }) {
    let chefDisplayString: string | null = null
    if (activeTab === "favorieten") {
        chefDisplayString = recipe.profiles?.display_name || "Auteur onbekend"
    } else if (recipe.profiles?.display_name) {
        chefDisplayString = recipe.profiles.display_name
    }

    return (
        <div className="group relative flex gap-4 rounded-xl border border-gray-300 bg-white p-4 shadow-md">
            <Link href={`/recipes/${recipe.id}`} className="flex flex-1 gap-4">
                <div className="relative aspect-square h-28 w-28 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                        src={recipe.thumbnail}
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="112px"
                    />
                </div>
                <div className="flex flex-1 flex-col py-0.5 pr-12">
                    <h2 className="text-bonchef-dark mb-0.5 line-clamp-2 font-['Montserrat'] text-lg font-semibold group-hover:underline">
                        {recipe.title}
                    </h2>
                    <div className="mb-1.5 flex flex-wrap items-center text-xs text-gray-600">
                        {recipe.total_cook_time_minutes !== undefined &&
                            recipe.total_cook_time_minutes > 0 && (
                                <>
                                    <p>{recipe.total_cook_time_minutes} min</p>
                                    <span className="mx-1.5">·</span>
                                    <p>Medium</p>
                                </>
                            )}
                    </div>
                    {chefDisplayString && (
                        <div className="mt-auto flex flex-wrap items-center font-['Montserrat'] text-[11px] text-gray-500">
                            <span>door {chefDisplayString}</span>
                        </div>
                    )}
                </div>
            </Link>
            <div className="absolute top-4 right-4 z-10">
                <LikeButton
                    buttonSize="sm"
                    recipeId={recipe.id}
                    initialLiked={recipe.is_liked_by_current_user}
                    initialLikeCount={recipe.like_count}
                    showCount={false}
                />
            </div>
        </div>
    )
}

function RecipeList({ recipes, activeTab }: { recipes: RecipeRead[]; activeTab: string }) {
    if (!recipes || recipes.length === 0) {
        return null
    }
    return (
        <div className="grid grid-cols-1 gap-4">
            {recipes.map((recipe) => (
                <RecipeListItem key={recipe.id} recipe={recipe} activeTab={activeTab} />
            ))}
        </div>
    )
}

function WelcomeSection() {
    return (
        <div className="mb-8">
            <p className="mb-6 text-lg text-gray-700">
                Welkom bij jouw kookboek! Hier vind je al jouw recepten en favorieten op één plek.
            </p>

            <Link href="/import">
                <Button className="mb-8">Voeg recept toe</Button>
            </Link>
        </div>
    )
}

function FavoritesCTA() {
    return (
        <div className="mb-8">
            <p className="mb-6 text-lg text-gray-700">
                Je hebt nog geen favoriete recepten. Ontdek nieuwe recepten op de ontdek pagina!
            </p>

            <Link href="/ontdek">
                <Button className="mb-8">Ontdek recepten</Button>
            </Link>
        </div>
    )
}

function RecipesSection() {
    const { recipes: userRecipes, isLoading: userRecipesLoading } = useOwnRecipes()
    const { recipes: likedRecipes, isLoading: likedRecipesLoading } = useLikedRecipes()
    const [activeTab, setActiveTab] = useQueryState("tab", {
        defaultValue: "my-recipes",
        parse: (value) => value as "my-recipes" | "favorieten",
        serialize: (value) => value,
    })
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

    const sortRecipes = (recipes: RecipeRead[], order: "newest" | "oldest"): RecipeRead[] => {
        if (!recipes) return []
        return [...recipes].sort((a: RecipeRead, b: RecipeRead) => {
            const dateA = new Date(a.created_at ?? "").getTime()
            const dateB = new Date(b.created_at ?? "").getTime()
            return order === "newest" ? dateB - dateA : dateA - dateB
        })
    }

    const loadingLogic = (
        isLoading: boolean,
        data: RecipeRead[],
        emptyComponent: React.ReactNode
    ) => {
        if (isLoading) {
            return <RecipeGridSkeleton />
        }

        if (data.length === 0) {
            return emptyComponent
        }

        const sortedData = sortRecipes(data, sortOrder)

        if (viewMode === "grid") {
            return <RecipeGrid recipes={sortedData} activeTab={activeTab} />
        }
        return <RecipeList recipes={sortedData} activeTab={activeTab} />
    }

    const collectionTabs = [
        { value: "my-recipes", label: "Mijn recepten" },
        { value: "favorieten", label: "Mijn favorieten" },
    ]

    return (
        <div className="space-y-6">
            <Tabs
                value={activeTab}
                defaultValue="my-recipes"
                onValueChange={(value) => setActiveTab(value as "my-recipes" | "favorieten")}
            >
                <AppTabsList tabs={collectionTabs} />

                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <Select
                            value={sortOrder}
                            onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
                        >
                            <SelectTrigger className="focus:ring-offset-bonchef-background min-w-max rounded-md border-yellow-300 bg-amber-100 px-3 py-0 text-[11px] leading-none font-medium text-yellow-800 transition-colors duration-150 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
                                <SelectValue placeholder="Sorteer op..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Nieuwste eerst</SelectItem>
                                <SelectItem value="oldest">Oudste eerst</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={
                                viewMode === "grid"
                                    ? "hover:bg-opacity-80 text-bonchef-dark bg-[#D4E6DE]"
                                    : "text-bonchef-dark border-[#D4E6DE]"
                            }
                        >
                            <LayoutGrid className="h-5 w-5" />
                            <span className="sr-only">Grid view</span>
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className={
                                viewMode === "list"
                                    ? "hover:bg-opacity-80 text-bonchef-dark bg-[#D4E6DE]"
                                    : "text-bonchef-dark border-[#D4E6DE]"
                            }
                        >
                            <List className="h-5 w-5" />
                            <span className="sr-only">List view</span>
                        </Button>
                    </div>
                </div>

                {activeTab === "my-recipes" && (
                    <TabsContent value="my-recipes" className="mt-6">
                        {loadingLogic(userRecipesLoading, userRecipes, <WelcomeSection />)}
                    </TabsContent>
                )}
                {activeTab === "favorieten" && (
                    <TabsContent value="favorieten" className="mt-6">
                        {loadingLogic(likedRecipesLoading, likedRecipes, <FavoritesCTA />)}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}

// Skeleton loader for recipe grid
function RecipeGridSkeleton() {
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

export default function CollectionPage() {
    return (
        <div className="bg-bonchef-background flex flex-1 flex-col space-y-4 px-4 pt-4 pb-10">
            <h1 className="text-bonchef-dark py-2 text-3xl font-bold">Jouw kookboek</h1>
            <Suspense fallback={<RecipeGridSkeleton />}>
                <RecipesSection />
            </Suspense>
        </div>
    )
}
