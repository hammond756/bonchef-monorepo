"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Recipe } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LikeButton } from "@/components/like-button"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useQueryState } from "nuqs"

function RecipeGrid({ recipes }: { recipes: (Recipe & { id: string })[] }) {
  if (!recipes || recipes.length === 0) {
    return
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
          <Link
            href={`/recipes/${recipe.id}`}
            className="block w-full h-full"
          >
            <Image
              src={recipe.thumbnail}
              alt={recipe.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
            />
            <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40">
              <h2 className="absolute bottom-4 left-4 text-md font-semibold text-white">
                {recipe.title}
              </h2>
            </div>
          </Link>
          <div className="absolute top-4 right-4">
            <LikeButton recipeId={recipe.id} initialLiked={recipe.is_liked_by_current_user} />
          </div>
        </div>
      ))}
    </div>
  )
}

function WelcomeSection() {
  return (
    <div className="mb-8">
      <p className="text-lg text-gray-700 mb-6">
        Welkom bij jouw recepten verzameling! Hier vind je al jouw recepten en favorieten op één plek.
      </p>
      
      <Link href="/">
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

  const loadingLogic = (isLoading: boolean, data: any, emptyComponent: React.ReactNode) => {
    if (isLoading) {
      return <RecipeGridSkeleton />
    }
    if (!data || data.length === 0) {
      return emptyComponent
    }
    return <RecipeGrid recipes={data} />
  }

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as "my-recipes" | "favorieten")}
      className="space-y-6"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-recipes">Mijn recepten</TabsTrigger>
        <TabsTrigger value="favorieten">Mijn favorieten</TabsTrigger>
      </TabsList>
      
      <TabsContent value="my-recipes">
        {loadingLogic(userRecipesLoading, userRecipes, <WelcomeSection />)}
      </TabsContent>
      
      <TabsContent value="favorieten">
        {loadingLogic(likedRecipesLoading, likedRecipes, <FavoritesCTA />)}
      </TabsContent>
    </Tabs>
  )
}

// Skeleton loader for recipe grid
function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  )
}

export default function CollectionPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<RecipeGridSkeleton />}>
        <RecipesSection />
      </Suspense>
    </main>
  )
}