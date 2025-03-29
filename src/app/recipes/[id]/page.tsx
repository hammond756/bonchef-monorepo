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
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = "auto"
export const revalidate = 3600 // Revalidate every hour

// Helper function to convert URLs in text to clickable links
function parseDescription(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Thumbnail */}
      <div className="relative w-full h-[400px] overflow-hidden mb-8">
        <Image
          src={recipe.thumbnail}
          alt={recipe.title}
          fill
          className="object-cover"
          data-testid="recipe-image"
          priority
        />
      </div>

      {/* Title and Description */}
      <div className="text-center mb-8">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
          {recipe.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {parseDescription(recipe.description)}
        </p>
      </div>

      {/* Recipe Info */}
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span>{recipe.total_cook_time_minutes} minuten</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>{recipe.n_portions} porties</span>
        </div>
        <div className="flex items-center gap-2">
          {recipe.is_public ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>Openbaar</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Privé</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Edit Link - only show if user owns the recipe */}
      {user && recipe.user_id === user.id && (
        <div className="flex justify-center mb-4">
          <Link
            href={`/edit/${id}`}
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700"
        >
          <PencilIcon className="h-4 w-4" />
            <span>Bewerk recept</span>
          </Link>
        </div>
      )}


      <div className="grid md:grid-cols-2 gap-8">
        {/* Ingredients */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Ingrediënten</h2>
          <Separator className="mb-4" />
          {recipe.ingredients.map((group: any, index: number) => (
            <div key={index} className="mb-6">
              {group.name !== "no_group" && <h3 className="font-medium mb-2">{group.name}</h3>}
              <ul className="space-y-2">
                {group.ingredients.map((ingredient: any, idx: number) => (
                  <li key={idx} className="text-muted-foreground">
                    {ingredient.quantity.low || ""} {ingredient.unit == "none" ? "" : ingredient.unit} {ingredient.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Instructies</h2>
          <Separator className="mb-4" />
          <ol className="space-y-4 list-decimal list-inside">
            {recipe.instructions.map((instruction: string, index: number) => (
              <li key={index} className="text-muted-foreground">
                {instruction}
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
