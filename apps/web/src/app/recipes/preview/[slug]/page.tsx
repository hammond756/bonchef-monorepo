import { getPreviewRecipe } from "./actions"
import { RecipeDetail } from "@/components/recipe-detail"
import { notFound } from "next/navigation"

interface RecipePreviewPageProps {
    params: Promise<{ slug: string }>
}

export default async function RecipePreviewPage({ params }: RecipePreviewPageProps) {
    const { slug } = await params

    // Extract recipe ID from slug (format: title~id)
    const recipeId = slug.split("~")[1]

    if (!recipeId) {
        notFound()
    }

    const recipe = await getPreviewRecipe(recipeId)

    if (!recipe) {
        notFound()
    }

    return <RecipeDetail recipe={recipe} variant="saved" />
}
