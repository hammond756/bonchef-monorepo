"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RecipeRead } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LikeButton } from "@/components/like-button"
import { useLikedRecipes } from "@/hooks/use-liked-recipes"
import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useQueryState } from "nuqs"
import ViewProfileAlert from "@/components/view-profile-alert"

function RecipeGrid({ recipes }: { recipes: RecipeRead[] }) {
  if (!recipes || recipes.length === 0) {
    return
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
          <Link
            href={`/recipes/${recipe.id}`}
            className="block w-full h-full"
          >
            <div className="relative aspect-square rounded-lg">
              <Image
                src={recipe.thumbnail}
                alt={recipe.title}
                fill
                className="object-cover transition-transform group-hover:scale-105 rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0">
                <div className="bg-gray-400/40 rounded-lg p-2">
                  <div className="flex items-center justify-between text-white">
                    <h2 className="text-md font-semibold line-clamp-2">
                      {recipe.title}
                    </h2>
                    <LikeButton variant="solid" buttonSize="md" className="text-white p-0" recipeId={recipe.id} initialLiked={recipe.is_liked_by_current_user} initialLikeCount={recipe.like_count} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
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
      <TabsList className="grid w-full grid-cols-2 bg-slate-200">
        <TabsTrigger className="data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-black" value="my-recipes">Mijn recepten</TabsTrigger>
        <TabsTrigger className="data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-black" value="favorieten">Mijn favorieten</TabsTrigger>
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
        <div key={i} className="relative aspect-4/3 overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  )
}

export default function CollectionPage() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <ViewProfileAlert />
      <Suspense fallback={<RecipeGridSkeleton />}>
        <RecipesSection />
      </Suspense>
    </main>
  )
}