import { getRecipe } from "./actions"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Clock, Users } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { PencilIcon } from "lucide-react"

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipe = await getRecipe(id)

  if (!recipe) {
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
          {recipe.description}
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
