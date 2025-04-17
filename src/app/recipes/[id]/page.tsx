import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Clock, Users, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { PencilIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ResolvingMetadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Metadata } from "next"
import { cookies } from "next/headers"
import { formatIngredientLine } from "@/lib/utils"
import { RecipeDetail } from "@/components/recipe-detail"
import { RecipeReadSchema } from "@/lib/types"
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = "auto"
export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params
  const {recipe, error} = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/recipes/${id}`, {next: { revalidate: 60 }, headers: {
    "Cookie": (await cookies()).toString()
  }})
    .then((res) => res.json())

  if (error || !recipe) {
    return {
      title: `Bonchef - Recept niet gevonden`,
    }
  }

  return {
    title: `Bonchef - ${recipe.title}`,
    openGraph: {
      images: [recipe.thumbnail],
      description: recipe.description,
      siteName: "Bonchef",
    },
  };
}

// Function to generate static paths
export async function generateStaticParams() {
  const supabase = await createAdminClient()
  
  // Only fetch public recipes for static generation
  const { data } = await supabase
    .from("recipe_creation_prototype")
    .select("id")
    .eq("is_public", true)
  
  // Return array of params for all public recipes
  return data?.map((recipe) => ({
    id: recipe.id,
  })) || []
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/public/recipes/${id}`
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Cookie": (await cookies()).toString()
    },
    cache: "no-store",
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.log("errorData", errorData)
    if (response.status === 404) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Recept niet gevonden</h1>
          <p className="text-lg text-gray-600 mb-8">Het recept dat je zoekt bestaat niet of is verwijderd.</p>
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Terug naar homepage
          </Link>
        </div>
      )
    }
    if (response.status === 403) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Recept niet toegankelijk</h1>
          <p className="text-lg text-gray-600 mb-8">Dit recept is privé en niet toegankelijk.</p>
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Terug naar homepage
          </Link>
        </div>
      )
    }
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Er is iets misgegaan</h1>
        <p className="text-lg text-gray-600 mb-8">Er is een fout opgetreden bij het laden van het recept.</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Terug naar homepage
        </Link>
      </div>
    )
  }

  const { recipe } = await response.json()

  console.log("recipe", recipe)
  const parsedRecipe = RecipeReadSchema.parse(recipe)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto max-w-4xl">
      <RecipeDetail 
        variant="saved"
        recipe={parsedRecipe}
        user={user || undefined}
      />
    </div>
  )
}
