"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteRecipe } from "@/app/edit/[id]/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { DestructiveButton } from "@/components/ui/destructive-button"

interface DeleteRecipeButtonProps {
    recipeId: string
    recipeTitle: string
    className?: string
}

export function DeleteRecipeButton({
    recipeId,
    recipeTitle,
    className,
}: Readonly<DeleteRecipeButtonProps>) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteRecipe(recipeId)
            toast({ title: "Recept verwijderd", description: "Recept succesvol verwijderd" })
            router.push("/")
        } catch (error) {
            console.error("Error deleting recipe:", error)
            toast({
                title: "Fout",
                description: "Er is een fout opgetreden bij het verwijderen van het recept",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DestructiveButton
            alertTitle="Recept verwijderen"
            alertDescription={`Weet je zeker dat je "${recipeTitle}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
            onConfirm={handleDelete}
            isLoading={isDeleting}
        >
            <Button
                variant="destructive"
                size="icon"
                className={className}
                aria-label="Recept verwijderen"
                disabled={isDeleting}
                data-testid="delete-recipe"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </DestructiveButton>
    )
}
