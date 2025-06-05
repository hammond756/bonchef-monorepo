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
import { LayoutGrid, List, Check } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

function RecipeGrid({ recipes, activeTab }: { recipes: RecipeRead[], activeTab: string }) {
  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {recipes.map((recipe) => {
        let chefDisplayGridString: string | null = null;
        if (activeTab === "favorieten") {
          chefDisplayGridString = recipe.profiles?.display_name || "Auteur onbekend";
        } else if (recipe.profiles?.display_name) {
          chefDisplayGridString = recipe.profiles.display_name;
        }

        const infoParts: string[] = [];

        if (recipe.total_cook_time_minutes !== undefined && recipe.total_cook_time_minutes > 0) {
          infoParts.push(`${recipe.total_cook_time_minutes} min`);
        }

        if ((recipe as any).difficulty) {
          infoParts.push((recipe as any).difficulty);
        } else if (recipe.total_cook_time_minutes !== undefined && recipe.total_cook_time_minutes > 0) {
          if (!(activeTab === "favorieten" && chefDisplayGridString)) {
            infoParts.push("Medium");
          }
        }

        if (chefDisplayGridString) {
          infoParts.push(`door ${chefDisplayGridString}`);
        }

        return (
          <div key={recipe.id} className="group overflow-hidden rounded-lg bg-white shadow-md border border-gray-300 flex flex-col">
            <Link
              href={`/recipes/${recipe.id}`}
              className="block w-full flex flex-col flex-grow"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={recipe.thumbnail}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                />
                <div className="absolute top-2 right-2 z-10">
                  <LikeButton buttonSize="sm" recipeId={recipe.id} initialLiked={recipe.is_liked_by_current_user} initialLikeCount={recipe.like_count} showCount={false} />
                </div>
                {(recipe as any).status && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(recipe as any).status === 'gemaakt' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {(recipe as any).status === 'gemaakt' ? 'Gemaakt' : 'Wil koken'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-bonchef-dark line-clamp-2 mb-0.5 font-['Montserrat']">
                    {recipe.title}
                  </h2>
                  <div className="mt-1 flex items-center text-[10px] text-gray-500 font-['Montserrat'] flex-wrap">
                    {infoParts.map((part, index) => (
                      <React.Fragment key={index}>
                        <span className="line-clamp-1">{part}</span>
                        {index < infoParts.length - 1 && <span className="mx-1">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )
      }
      )}
    </div>
  )
}

function RecipeListItem({ recipe, activeTab }: { recipe: RecipeRead, activeTab: string }) {
  let chefDisplayString: string | null = null;
  if (activeTab === "favorieten") {
    chefDisplayString = recipe.profiles?.display_name || "Auteur onbekend";
  } else if (recipe.profiles?.display_name) {
    chefDisplayString = recipe.profiles.display_name;
  }

  return (
    <div className="flex gap-4 p-4 bg-white shadow-md border border-gray-300 rounded-xl group relative">
      <Link href={`/recipes/${recipe.id}`} className="flex gap-4 flex-1 items-start">
        <div className="relative aspect-square w-28 h-28 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={recipe.thumbnail}
            alt={recipe.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="112px"
          />
        </div>
        <div className="flex flex-col flex-1 py-0.5 pr-12">
          <h2 className="text-lg font-semibold text-bonchef-dark line-clamp-2 group-hover:underline font-['Montserrat'] mb-0.5">
            {recipe.title}
          </h2>
          {chefDisplayString && activeTab !== "favorieten" && (
            <p className="text-xs text-gray-500 line-clamp-1 font-['Montserrat'] mt-0.5 mb-1.5">
              door {chefDisplayString}
            </p>
          )}
          <div className="flex items-center text-xs text-gray-600 mb-1.5 flex-wrap">
            {recipe.total_cook_time_minutes !== undefined && recipe.total_cook_time_minutes > 0 && (
              <p>{recipe.total_cook_time_minutes} min</p>
            )}
            {recipe.total_cook_time_minutes !== undefined && recipe.total_cook_time_minutes > 0 &&
              ((recipe as any).difficulty || (recipe.total_cook_time_minutes !== undefined && recipe.total_cook_time_minutes > 0)) && (
                <span className="mx-1.5">·</span>
              )}
            {(recipe as any).difficulty ? (
              <p>{(recipe as any).difficulty}</p>
            ) : recipe.total_cook_time_minutes !== undefined && recipe.total_cook_time_minutes > 0 ? (
              <p>Medium</p>
            ) : null}
          </div>
          {chefDisplayString && (
            <div className="flex items-center text-[11px] text-gray-500 font-['Montserrat'] mt-0.5 flex-wrap">
              {chefDisplayString && (
                <span>door {chefDisplayString}</span>
              )}
            </div>
          )}
          {(recipe as any).status && (
            <div className="mt-auto">
              {(recipe as any).status === 'gemaakt' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Gemaakt
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Wil koken
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="absolute top-4 right-4 z-10">
        <LikeButton buttonSize="sm" recipeId={recipe.id} initialLiked={recipe.is_liked_by_current_user} initialLikeCount={recipe.like_count} showCount={false} />
      </div>
    </div>
  );
}

function RecipeList({ recipes, activeTab }: { recipes: RecipeRead[], activeTab: string }) {
  if (!recipes || recipes.length === 0) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      {recipes.map((recipe) => (
        <RecipeListItem key={recipe.id} recipe={recipe} activeTab={activeTab} />
      ))}
    </div>
  );
}

function WelcomeSection() {
  return (
    <div className="mb-8">
      <p className="text-lg text-gray-700 mb-6">
        Welkom bij jouw recepten verzameling! Hier vind je al jouw recepten en favorieten op één plek.
      </p>

      <Link href="/import">
        <Button className="mb-8">
          Voeg recept toe
        </Button>
      </Link>
    </div>
  )
}

function FavoritesCTA() {
  return (
    <div className="mb-8">
      <p className="text-lg text-gray-700 mb-6">
        Je hebt nog geen favoriete recepten. Ontdek nieuwe recepten op de ontdek pagina!
      </p>

      <Link href="/ontdek">
        <Button className="mb-8">
          Ontdek recepten
        </Button>
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
    return [...recipes].sort((a, b) => {
      const dateA = new Date((a as any).created_at).getTime();
      const dateB = new Date((b as any).created_at).getTime();
      return order === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const loadingLogic = (isLoading: boolean, data: RecipeRead[] | undefined, emptyComponent: React.ReactNode) => {
    if (isLoading) {
      return <RecipeGridSkeleton />
    }
    const sortedData = data ? sortRecipes(data, sortOrder) : [];
    if (!sortedData || sortedData.length === 0) {
      return emptyComponent
    }
    if (viewMode === "grid") {
      return <RecipeGrid recipes={sortedData} activeTab={activeTab} />;
    }
    return <RecipeList recipes={sortedData} activeTab={activeTab} />;
  }

  const collectionTabs = [
    { value: "my-recipes", label: "Mijn recepten" },
    { value: "favorieten", label: "Mijn favorieten" },
  ];

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        defaultValue="my-recipes"
        onValueChange={(value) => setActiveTab(value as "my-recipes" | "favorieten")}
      >
        <AppTabsList
          tabs={collectionTabs}
        />

        <div className="flex justify-between items-end mt-4">
          <div>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
              <SelectTrigger
                className="min-w-max rounded-md px-3 py-0 text-[11px] font-medium leading-none
                         bg-amber-100 text-yellow-800 
                         border-yellow-300 focus:ring-2 focus:ring-yellow-400 
                         focus:ring-offset-2 focus:ring-offset-bonchef-background transition-colors duration-150"
              >
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
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-[#D4E6DE] hover:bg-opacity-80 text-bonchef-dark' : 'border-[#D4E6DE] text-bonchef-dark'}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#D4E6DE] hover:bg-opacity-80 text-bonchef-dark' : 'border-[#D4E6DE] text-bonchef-dark'}
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
    <div className="flex flex-1 flex-col px-4 space-y-4 pt-4 pb-10 bg-bonchef-background">
      <h1 className="text-3xl font-bold text-bonchef-dark py-2">Jouw kookboek</h1>
      <Suspense fallback={<RecipeGridSkeleton />}>
        <RecipesSection />
      </Suspense>
    </div>
  )
}