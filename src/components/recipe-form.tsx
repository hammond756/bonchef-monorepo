"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
    LoaderIcon,
    ImageIcon,
    Trash2 as TrashIcon,
    Plus as PlusIcon,
    AlertCircle,
} from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Recipe, Unit } from "@/lib/types"
import { RecipeStatusEnum } from "@/lib/types"
import { Alert, AlertDescription } from "./ui/alert"
import { useRouter } from "next/navigation"
import { deleteRecipe, updateRecipe } from "@/app/edit/[id]/actions"
import { ImageGenerationModal } from "./image-generation-modal"
import { RecipeVisibilityModal } from "./recipe-visibility-modal"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning"
import { useNavigationStore } from "@/lib/store/navigation-store"
import { createClient } from "@/utils/supabase/client"
import { createRecipeSlug } from "@/lib/utils"
import { StorageService } from "@/lib/services/storage-service"
import { v4 as uuidv4 } from "uuid"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics/track"
import { getJobByRecipeId } from "@/lib/services/recipe-imports-job/client"
import { useOwnRecipes } from "@/hooks/use-own-recipes"

interface RecipeFormProps {
    recipe: Recipe
    recipeId: string
    isPublic?: boolean
    isOnboardingFlow?: boolean
}

function autoResizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = "auto"
    element.style.height = `${element.scrollHeight}px`
}

function createDefaultIngredient(): Recipe["ingredients"][number]["ingredients"][number] {
    return {
        quantity: { type: "range", low: 0, high: 0 },
        unit: "g" as Unit,
        description: "",
    }
}

function updateIngredientInGroup(
    ingredients: Recipe["ingredients"],
    groupIdx: number,
    updateFn: (group: (typeof ingredients)[number]) => (typeof ingredients)[number]
) {
    return ingredients.map((group, idx) => (idx === groupIdx ? updateFn(group) : group))
}

export function RecipeForm({
    recipe: initialRecipe,
    recipeId,
    isPublic = false,
    isOnboardingFlow = false,
}: RecipeFormProps) {
    const [recipe, setRecipe] = useState(initialRecipe)
    const [isDirty, setIsDirty] = useState(false)
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [imageError, setImageError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
    const router = useRouter()
    const lastBrowsingPath = useNavigationStore((state) => state.history.at(-1))

    const { count: countOwnRecipes } = useOwnRecipes()

    useUnsavedChangesWarning(isDirty)

    async function proceedWithCancel() {
        if (recipe.status === RecipeStatusEnum.enum.DRAFT) {
            // Keep the draft status when canceling so it stays in collection
            // No need to update status as it should remain DRAFT
        }

        // Use the same smart back navigation logic as BackButton
        if (typeof window !== "undefined" && window.history.state && window.history.length > 2) {
            router.back()
        } else {
            // Fallback to /discover page if no history
            router.push("/ontdek")
        }
    }

    async function handleCancel() {
        if (isDirty) {
            setIsCancelConfirmOpen(true)
        } else {
            await proceedWithCancel()
        }
    }

    // Use the file upload hook
    const {
        preview,
        file,
        fileInputRef,
        handleChange: baseHandleFileChange,
        setPreview,
    } = useFileUpload({ initialFilePath: recipe.thumbnail })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        baseHandleFileChange(e)
        setIsDirty(true)
    }

    useEffect(() => {
        // Resize all textareas on mount and when recipe changes
        document.querySelectorAll("textarea").forEach((textarea) => {
            autoResizeTextarea(textarea)
        })
    }, [recipe])

    async function handleGenerateImage(settings?: { camera_angle?: string; keukenstijl?: string }) {
        setIsGenerating(true)
        setImageError(null)

        try {
            const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipe: recipe,
                    prompt_variables: {
                        camera_angle: settings?.camera_angle,
                        keukenstijl: settings?.keukenstijl,
                    },
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate image")
            }

            const data = await response.json()

            // Simply set the image data in the recipe state
            // The server will handle the upload to Supabase Storage when saving
            setRecipe((prev) => ({ ...prev, thumbnail: data.image }))
            setPreview(data.image)
            setIsDirty(true)
        } catch (error) {
            console.error("Failed to generate image:", error)
            setImageError("Failed to generate image. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    async function uploadImage(file: File): Promise<string> {
        const supabase = await createClient()
        const storageService = new StorageService(supabase)
        const fileExt = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const imageUrl = await storageService.uploadImage("recipe-images", file, true, fileName)
        return imageUrl
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitError(null)

        // Open the visibility modal instead of saving directly
        setIsVisibilityModalOpen(true)
    }

    async function saveRecipe(isPublic: boolean) {
        setIsSaving(true)

        let imageUrl = null
        if (file) {
            imageUrl = await uploadImage(file)
        }

        try {
            const wasDraft = recipe.status === RecipeStatusEnum.enum.DRAFT

            const response = await updateRecipe(recipeId, {
                ...recipe,
                is_public: isPublic,
                thumbnail: imageUrl || recipe.thumbnail,
            })

            const job = await getJobByRecipeId(recipeId)

            if (wasDraft && response.status === RecipeStatusEnum.enum.PUBLISHED && job.success) {
                trackEvent("added_recipe", {
                    recipe_id: response.id,
                    recipe_count: countOwnRecipes(),
                    job_id: job.data.id,
                    method: job.data.source_type,
                    stage: "published",
                })
            }

            if (isOnboardingFlow) {
                router.push(
                    `/recipes/preview/${createRecipeSlug(response.title, recipeId || response.id)}`
                )
                return
            }

            // TODO: consider mutating own-recipes and import-jobs

            const sourceUrl = lastBrowsingPath || "/ontdek"
            router.push(
                `/recipes/${createRecipeSlug(response.title, response.id)}?from=edit&source=${encodeURIComponent(sourceUrl)}`
            )
        } catch (error) {
            console.error("Failed to save recipe:", error)
            setSubmitError("Failed to save recipe. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    function handleTextareaChange(
        e: React.ChangeEvent<HTMLTextAreaElement>,
        updateFn: (value: string) => void
    ) {
        autoResizeTextarea(e.target)
        updateFn(e.target.value)
        setIsDirty(true)
    }

    function handleAddIngredient(groupIdx: number) {
        setRecipe((prev) => ({
            ...prev,
            ingredients: updateIngredientInGroup(prev.ingredients, groupIdx, (group) => ({
                ...group,
                ingredients: [...group.ingredients, createDefaultIngredient()],
            })),
        }))
        setIsDirty(true)
    }

    function handleRemoveIngredient(groupIdx: number, ingredientIdx: number) {
        setRecipe((prev) => ({
            ...prev,
            ingredients: updateIngredientInGroup(prev.ingredients, groupIdx, (group) => ({
                ...group,
                ingredients: group.ingredients.filter((_, idx) => idx !== ingredientIdx),
            })),
        }))
        setIsDirty(true)
    }

    function handleIngredientChange(
        groupIdx: number,
        ingredientIdx: number,
        updateFn: (
            ingredient: Recipe["ingredients"][number]["ingredients"][number]
        ) => Recipe["ingredients"][number]["ingredients"][number]
    ) {
        setRecipe((prev) => {
            const updatedIngredients = [...prev.ingredients]
            const group = updatedIngredients[groupIdx]
            if (group) {
                const newIngredients = [...group.ingredients]
                newIngredients[ingredientIdx] = updateFn(newIngredients[ingredientIdx])
                updatedIngredients[groupIdx] = {
                    ...group,
                    ingredients: newIngredients,
                }
            }
            return {
                ...prev,
                ingredients: updatedIngredients,
            }
        })
        setIsDirty(true)
    }

    function handleAddInstruction() {
        setRecipe((prev) => ({
            ...prev,
            instructions: [...prev.instructions, ""],
        }))
        setIsDirty(true)
    }

    function handleRemoveInstruction(idx: number) {
        setRecipe((prev) => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== idx),
        }))
        setIsDirty(true)
    }

    async function handleDeleteRecipe(recipeId: string) {
        try {
            await deleteRecipe(recipeId)
            router.push("/collection")
        } catch (error) {
            setSubmitError("Failed to delete recipe.")
            console.error("Failed to delete recipe:", error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="flex w-full flex-col items-start gap-4">
                    <div className="w-full">
                        <div className="flex flex-col space-y-3">
                            <h2 className="text-xl font-semibold">Afbeelding</h2>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    disabled={isGenerating}
                                    onClick={() => setIsImageModalOpen(true)}
                                    data-testid="generate-image-button"
                                    aria-label="Afbeelding genereren"
                                >
                                    {isGenerating ? (
                                        <>
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                            Genereren...
                                        </>
                                    ) : (
                                        "Afbeelding genereren"
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isGenerating}
                                    data-testid="upload-image-button"
                                    aria-label="Afbeelding uploaden"
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Upload afbeelding
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {imageError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{imageError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {preview && (
                                <div className="group relative mt-4 w-full sm:-mx-6 md:-mx-8 lg:-mx-12">
                                    <Image
                                        src={preview}
                                        width={1000}
                                        height={1000}
                                        alt="Recipe preview"
                                        data-testid="recipe-image-preview"
                                        className="h-[300px] w-full object-contain md:h-[400px]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Input
                    className="bg-white"
                    value={recipe.title}
                    onChange={(e) => {
                        setRecipe((prev) => ({ ...prev, title: e.target.value }))
                        setIsDirty(true)
                    }}
                    placeholder="Recept naam"
                />

                <Textarea
                    value={recipe.description}
                    onChange={(e) =>
                        handleTextareaChange(e, (value) =>
                            setRecipe((prev) => ({ ...prev, description: value }))
                        )
                    }
                    placeholder="Beschrijving"
                    className="min-h-[100px] overflow-hidden bg-white"
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Portie grootte</h2>
                    <div className="flex items-center gap-2">
                        <Input
                            className="w-24 bg-white"
                            type="text"
                            value={recipe.n_portions || ""}
                            onChange={(e) =>
                                setRecipe((prev) => ({
                                    ...prev,
                                    n_portions: parseInt(e.target.value),
                                }))
                            }
                            placeholder="Porties"
                            data-testid="portions-input"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">porties</span>
                    </div>
                </div>

                <h2 className="text-xl font-semibold">Ingredienten</h2>
                {recipe.ingredients.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-4">
                        {group.name !== "no_group" && (
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                {group.name}
                            </h3>
                        )}
                        <div className="ingredients-list">
                            {group.ingredients.map((ingredient, ingredientIdx) => (
                                <div
                                    key={`${groupIdx}-${ingredientIdx}`}
                                    className="flex gap-2"
                                    data-testid="ingredient-item"
                                >
                                    <Input
                                        type="number"
                                        value={ingredient.quantity.low}
                                        onChange={(e) =>
                                            handleIngredientChange(
                                                groupIdx,
                                                ingredientIdx,
                                                (ing) => ({
                                                    ...ing,
                                                    quantity: {
                                                        ...ing.quantity,
                                                        low: parseInt(e.target.value, 10),
                                                    },
                                                })
                                            )
                                        }
                                        className="w-16"
                                    />
                                    <Input
                                        type="text"
                                        value={ingredient.unit}
                                        onChange={(e) =>
                                            handleIngredientChange(
                                                groupIdx,
                                                ingredientIdx,
                                                (ing) => ({
                                                    ...ing,
                                                    unit: e.target.value,
                                                })
                                            )
                                        }
                                        className="w-24"
                                        placeholder="g"
                                    />
                                    <Input
                                        value={ingredient.description}
                                        onChange={(e) =>
                                            handleIngredientChange(
                                                groupIdx,
                                                ingredientIdx,
                                                (ing) => ({
                                                    ...ing,
                                                    description: e.target.value,
                                                })
                                            )
                                        }
                                        className="flex-1"
                                        placeholder="bv. fijngehakt"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleRemoveIngredient(groupIdx, ingredientIdx)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                        data-testid="remove-ingredient"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddIngredient(groupIdx)}
                            className="mt-2"
                            data-testid="add-ingredient"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Ingredient toevoegen
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Bereiding</h2>
                {recipe.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex items-start gap-2" data-testid={`instruction`}>
                        <span className="mt-2 w-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {idx + 1}.
                        </span>
                        <Textarea
                            value={instruction}
                            onChange={(e) =>
                                handleTextareaChange(e, (value) =>
                                    setRecipe((prev) => ({
                                        ...prev,
                                        instructions: prev.instructions.map((inst, i) =>
                                            i === idx ? value : inst
                                        ),
                                    }))
                                )
                            }
                            className="min-h-[60px] overflow-hidden bg-white"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveInstruction(idx)}
                            className="text-red-500 hover:text-red-700"
                            data-testid="remove-instruction"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInstruction}
                    className="mt-2"
                    data-testid="add-instruction"
                >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Voeg stap toe
                </Button>
            </div>

            <div className="space-x-4 pb-8">
                {submitError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-4">
                    <Button type="submit" data-testid="save-recipe" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                Opslaan...
                            </>
                        ) : (
                            "Opslaan"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        data-testid="cancel-recipe"
                    >
                        Annuleren
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:border-red-700 hover:text-red-700"
                        onClick={() => handleDeleteRecipe(recipeId)}
                        data-testid="delete-recipe"
                    >
                        Verwijder recept
                    </Button>
                </div>
            </div>

            <ImageGenerationModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSubmit={handleGenerateImage}
            />

            <RecipeVisibilityModal
                isOpen={isVisibilityModalOpen}
                onClose={() => setIsVisibilityModalOpen(false)}
                onConfirm={(isPublic: boolean) => saveRecipe(isPublic)}
                defaultVisibility={isPublic}
            />

            <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Je hebt wijzigingen die nog niet zijn opgeslagen. Als je annuleert, gaan
                            deze wijzigingen verloren.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Blijf bewerken</AlertDialogCancel>
                        <AlertDialogAction onClick={proceedWithCancel}>
                            Annuleer en verlies wijzigingen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
}
