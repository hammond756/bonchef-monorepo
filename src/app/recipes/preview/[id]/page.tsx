import { getPreviewRecipe } from "./actions"
import { RecipeDetail } from "@/components/recipe-detail"
import { notFound } from "next/navigation"

interface RecipePreviewPageProps {
    params: Promise<{ id: string }>
}

export default async function RecipePreviewPage({ params }: RecipePreviewPageProps) {
    const { id } = await params
    const recipe = await getPreviewRecipe(id)

    if (!recipe) {
        notFound()
    }

    return <RecipeDetail recipe={recipe} variant="saved" />
}
