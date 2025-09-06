"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteRecipe } from "@/app/edit/[id]/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

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
        <AlertDialog>
            <AlertDialogTrigger asChild>
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
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Recept verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Weet je zeker dat je &quot;{recipeTitle}&quot; wilt verwijderen? Deze actie
                        kan niet ongedaan worden gemaakt.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? "Verwijderen..." : "Verwijderen"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
