import { getRecipe } from "./actions"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Clock, Users } from "lucide-react"

export default async function RecipePage({ params }: { params: { id: string } }) {
  const { id } = params
  const recipe = await getRecipe(id)

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Thumbnail */}
      <div className="relative w-full h-[400px] overflow-hidden mb-8">
        <Image
          src={recipe.thumbnail}
          alt={recipe.title}
          fill
          className="object-cover"
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
      <div className="flex justify-center gap-8 mb-12">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span>{recipe.total_cook_time_minutes} minuten</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>{recipe.n_portions} porties</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Ingredients */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Ingrediënten</h2>
          <Separator className="mb-4" />
          {recipe.ingredients.map((group: any, index: number) => (
            <div key={index} className="mb-6">
              <h3 className="font-medium mb-2">{group.name}</h3>
              <ul className="space-y-2">
                {group.ingredients.map((ingredient: any, idx: number) => (
                  <li key={idx} className="text-muted-foreground">
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
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
