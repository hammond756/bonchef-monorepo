import { getRecipe } from "@/app/recipes/[slug]/actions"
import { RecipeForm } from "@/components/recipe-form"
import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { createRecipeSlug } from "@/lib/utils"
import { PageContentSpacer } from "@/components/layout/page-content-spacer"

export default async function EditRecipePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = await params
    const isOnboardingFlow = (await searchParams)?.from === "onboarding"

    const recipe = await getRecipe(id)
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!recipe) {
        console.log(`Recipe ${id} not found, redirecting to 404`)
        notFound()
    }

    const marketingUserId = process.env.NEXT_PUBLIC_MARKETING_USER_ID
    const isMarketingRecipe = recipe.user_id === marketingUserId

    if (user) {
        // Logged-in user can only edit their own recipes.
        if (recipe.user_id !== user.id) {
            redirect("/recipes/" + createRecipeSlug(recipe.title, id))
        }
    } else {
        // Anonymous user can only edit a marketing recipe.
        if (!isMarketingRecipe) {
            redirect(`/login?redirect=/edit/${id}`)
        }
    }

    return (
        <>
            <PageContentSpacer />
            <main className="container mx-auto p-4">
                <h1 className="mb-6 text-2xl font-bold">Recept bewerken</h1>
                <RecipeForm
                    recipe={recipe}
                    recipeId={id}
                    isPublic={recipe.is_public}
                    isOnboardingFlow={isOnboardingFlow}
                />
            </main>
        </>
    )
}
