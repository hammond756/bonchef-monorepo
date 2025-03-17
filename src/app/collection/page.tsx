import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getRecipes } from "../actions"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

async function RecipesSection({ userId }: { userId: string }) {
  const recipes = await getRecipes(userId)
  
  return (
    <div className="grid grid-cols-2 gap-6">
      {recipes?.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipes/${recipe.id}`}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg"
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
      ))}
    </div>
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

async function WelcomeSection() {
  
  return (
    <div className="mb-8">
      <p className="text-lg text-gray-700 mb-6">
        Welkom bij jouw recepten verzameling! Hier vind je al jouw favoriete 
        recepten op één plek.
      </p>
      
      <Link href="/">
        <Button className="mb-8">
          Voeg recept toe
        </Button>
      </Link>
    </div>
  )
}

export default async function CollectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <WelcomeSection />
      
      <Suspense fallback={<RecipeGridSkeleton />}>
        <RecipesSection userId={user.id} />
      </Suspense>
    </main>
  )
}