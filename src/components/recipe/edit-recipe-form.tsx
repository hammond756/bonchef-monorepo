"use client"

import { useCallback, useState } from "react"
import { useRecipeEditContext } from "./recipe-edit-context"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { RecipeInformationSection } from "./recipe-information-section"
import { IngredientGroupManager } from "./ingredient-group-manager"
import { PreparationSteps } from "./preparation-steps"
import {
    NavigationWarningDialog,
    useNavigationWarningDialog,
} from "@/components/ui/navigation-warning-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { RecipeVisibilityModal } from "../recipe-visibility-modal"
import { CameraModal } from "./camera-modal"
import { createRecipeSlug } from "@/lib/utils"
import { useIngredientGroups } from "@/hooks/use-ingredient-groups"
import { usePreparationSteps } from "@/hooks/use-preparation-steps"
import { uploadRecipeImage } from "@/lib/services/storage/client"

interface EditRecipeFormProps {
    isPublic?: boolean
    isOnboardingFlow?: boolean
}

export function EditRecipeForm({
    isPublic = false,
    isOnboardingFlow = false,
}: EditRecipeFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const navigationDialog = useNavigationWarningDialog()

    const {
        recipe: currentRecipe,
        errors,
        isGenerating,
        hasUnsavedChanges,
        updateField,
        updateIngredients,
        updateInstructions,
        setImageUrl,
        setGenerating,
        saveRecipe,
        isVisibilityModalOpen,
        closeVisibilityModal,
    } = useRecipeEditContext()

    const recipeId = currentRecipe.id

    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)

    const [groups, isExpanded, groupsApi] = useIngredientGroups(
        currentRecipe.ingredients,
        updateIngredients
    )
    const [steps, stepsApi] = usePreparationSteps(currentRecipe.instructions, updateInstructions)

    useUnsavedChanges({
        hasUnsavedChanges,
        onBeforeUnload: () => {},
    })

    const handleImageChange = useCallback(
        async (file: File) => {
            try {
                const { url } = await uploadRecipeImage(file)
                setImageUrl(url)
            } catch (_error) {
                console.error("Error uploading image:", _error)
            }
        },
        [setImageUrl]
    )

    const handlePhotoCaptured = useCallback(
        (file: File) => {
            handleImageChange(file)
        },
        [handleImageChange]
    )

    const handleGenerateImage = useCallback(async () => {
        try {
            setGenerating(true)
            const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipe: currentRecipe,
                    prompt_variables: {
                        title: currentRecipe.title,
                        description: currentRecipe.description,
                    },
                }),
            })

            if (!response.ok) throw new Error("Failed to generate image")
            const data = await response.json()
            if (data.error) throw new Error(data.error)
            setImageUrl(data.image)
        } catch (error) {
            console.error("Error generating image:", error)
        } finally {
            setGenerating(false)
        }
    }, [currentRecipe, setImageUrl, setGenerating])

    const handleSaveWithVisibility = useCallback(
        async (isPublicChoice: boolean) => {
            closeVisibilityModal()
            try {
                await saveRecipe(isPublicChoice)
                if (isOnboardingFlow) {
                    router.push(
                        `/recipes/preview/${createRecipeSlug(currentRecipe.title, recipeId)}`
                    )
                } else {
                    router.push(
                        `/recipes/${createRecipeSlug(currentRecipe.title, recipeId)}?from=edit`
                    )
                }
            } catch (_error) {
                toast({
                    title: "Opslaan mislukt",
                    description: "Er is een fout opgetreden bij het opslaan van het recept.",
                    variant: "destructive",
                })
            }
        },
        [
            saveRecipe,
            isOnboardingFlow,
            recipeId,
            router,
            toast,
            closeVisibilityModal,
            currentRecipe.title,
        ]
    )

    return (
        <div>
            <div className="space-y-8">
                <RecipeInformationSection
                    imageUrl={currentRecipe.thumbnail}
                    onImageChange={handleImageChange}
                    onGenerateImage={handleGenerateImage}
                    isGenerating={isGenerating}
                    title={currentRecipe.title}
                    onTitleChange={(title) => updateField("title", title)}
                    cookingTime={currentRecipe.total_cook_time_minutes}
                    onCookingTimeChange={(time) => updateField("total_cook_time_minutes", time)}
                    servings={currentRecipe.n_portions}
                    onServingsChange={(servings) => updateField("n_portions", servings)}
                    description={currentRecipe.description || ""}
                    onDescriptionChange={(description) => {
                        updateField("description", description)
                    }}
                    source={currentRecipe.source_name || ""}
                    onSourceChange={(source) => updateField("source_name", source)}
                    onTakePhoto={() => setIsCameraModalOpen(true)}
                    errors={errors as Record<string, string | undefined>}
                />
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ingrediënten</h3>
                    <IngredientGroupManager
                        groups={groups}
                        isExpanded={isExpanded}
                        api={groupsApi}
                    />
                </div>
                <PreparationSteps steps={steps} api={stepsApi} />
                <div className="h-20" />
            </div>
            <NavigationWarningDialog
                isOpen={navigationDialog.isOpen}
                onClose={navigationDialog.handleCancel}
                onConfirm={navigationDialog.handleConfirm}
                onCancel={navigationDialog.handleCancel}
            />
            <RecipeVisibilityModal
                isOpen={isVisibilityModalOpen}
                onClose={closeVisibilityModal}
                onConfirm={handleSaveWithVisibility}
                defaultVisibility={isPublic}
            />
            <CameraModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onPhotoCaptured={handlePhotoCaptured}
            />
        </div>
    )
}
