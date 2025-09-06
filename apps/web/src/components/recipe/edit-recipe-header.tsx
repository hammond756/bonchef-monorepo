"use client"

import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useRecipeEditContext } from "./recipe-edit-context"
import { DeleteRecipeButton } from "./delete-recipe-button"

interface EditRecipeHeaderProps {
    onBack?: () => void
    className?: string
    recipeId?: string
    recipeTitle?: string
}

export function EditRecipeHeader({
    onBack,
    className,
    recipeId,
    recipeTitle,
}: EditRecipeHeaderProps) {
    const router = useRouter()
    const { isSaving, canSave, handleSave } = useRecipeEditContext()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    return (
        <header
            className={cn(
                "bg-background sticky top-0 z-50 flex h-16 items-center justify-between border-b px-4 shadow-sm",
                className
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 rounded-full"
                aria-label="Terug naar recept"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>

            <h1 className="text-foreground text-lg font-semibold">Bewerken</h1>

            <div className="flex items-center gap-2">
                {recipeId && recipeTitle && (
                    <DeleteRecipeButton
                        recipeId={recipeId}
                        recipeTitle={recipeTitle}
                        className="h-10 w-10"
                    />
                )}
                <Button
                    onClick={handleSave}
                    disabled={!canSave || isSaving}
                    className={cn("h-10 px-6 font-medium", isSaving && "animate-pulse")}
                    aria-label="Opslaan"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Opslaan...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            <span>Opslaan</span>
                        </div>
                    )}
                </Button>
            </div>
        </header>
    )
}
