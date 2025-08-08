"use client"

import { getRecipe } from "@/app/recipes/[slug]/actions"
import { EditRecipeForm } from "@/components/recipe/edit-recipe-form"
import { notFound } from "next/navigation"
import { EditRecipeHeader } from "@/components/recipe/edit-recipe-header"
import { ValidationErrorHeaderWrapper } from "@/components/recipe/validation-error-header-wrapper"
import { useEffect, useState } from "react"
import { Recipe } from "@/lib/types"
import { useRouter } from "next/navigation"
import {
    useNavigationWarningDialog,
    NavigationWarningDialog,
} from "@/components/ui/navigation-warning-dialog"
import { RecipeEditProvider } from "@/components/recipe/recipe-edit-context"

export default function EditRecipePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isOnboardingFlow, setIsOnboardingFlow] = useState(false)
    const router = useRouter()
    const navigationDialog = useNavigationWarningDialog()

    useEffect(() => {
        const loadRecipe = async () => {
            try {
                const { id } = await params
                const searchParamsData = await searchParams
                const isOnboardingFlow = searchParamsData?.from === "onboarding"

                const recipeData = await getRecipe(id)

                if (!recipeData) {
                    console.log(`Recipe ${id} not found, redirecting to 404`)
                    notFound()
                }

                setRecipe(recipeData)
                setIsOnboardingFlow(isOnboardingFlow)
            } catch (error) {
                console.error("Error loading recipe:", error)
                notFound()
            } finally {
                setIsLoading(false)
            }
        }

        loadRecipe()
    }, [params, searchParams])

    const handleBack = () => {
        navigationDialog.showWarning(() => router.back())
    }

    if (isLoading) {
        return (
            <div className="bg-background min-h-screen">
                <main className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                            <p className="text-muted-foreground">Recept laden...</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (!recipe) {
        return null
    }

    return (
        <div className="bg-background min-h-screen">
            <RecipeEditProvider recipe={recipe}>
                <EditRecipeHeader
                    onBack={handleBack}
                    recipeId={recipe.id}
                    recipeTitle={recipe.title}
                />
                <ValidationErrorHeaderWrapper>
                    <main className="container mx-auto px-4 py-6">
                        <EditRecipeForm
                            isPublic={recipe.is_public}
                            isOnboardingFlow={isOnboardingFlow}
                        />
                    </main>
                </ValidationErrorHeaderWrapper>
            </RecipeEditProvider>

            {/* Navigation Warning Dialog */}
            <NavigationWarningDialog
                isOpen={navigationDialog.isOpen}
                onClose={navigationDialog.handleCancel}
                onConfirm={navigationDialog.handleConfirm}
                onCancel={navigationDialog.handleCancel}
            />
        </div>
    )
}
