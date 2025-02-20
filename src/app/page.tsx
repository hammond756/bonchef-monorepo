import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getRecipes } from "./actions"

interface Recipe {
  id: string
  title: string
  imageUrl: string
}

export default async function HomePage() {
  const recipes = await getRecipes()
  console.log(recipes)

  if (recipes === null || recipes === undefined) {
    return
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-6">
          Welkom bij jouw recepten verzameling! Hier vind je al jouw favoriete 
          recepten op één plek. {recipes.length === 0 ? "Begin met het toevoegen van je eerste recept." : ""}
        </p>
        
        <Link href="/create">
          <Button className="mb-8">
            Voeg recept toe
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {recipes.map((recipe) => (
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
    </main>
  )
}
