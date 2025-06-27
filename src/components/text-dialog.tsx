"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ProgressModal } from "../app/first-recipe/progress-modal"
import { usePostHog } from "posthog-js/react"

interface TextDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (validFormData: { text: string }) => void
}

function TextForm({ onSubmit }: { onSubmit: (validFormData: { text: string }) => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const posthog = usePostHog()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const text = formData.get("text") as string
        if (!text) {
            setError("Voer een geldige tekst in.")
            setIsLoading(false)
            return
        }
        try {
            onSubmit({ text })
        } catch (e: unknown) {
            posthog?.captureException(e)
            setError("Er is iets misgegaan. Probeer het opnieuw.")
            setIsLoading(false)
        }
    }

    const progressSteps = [
        "🧑‍🍳 Ingrediënten ophalen...",
        "📝 Recept schrijven...",
        "📸 Foto maken...",
        "🍚 Porties berekenen...",
        "✨ Een moment geduld...",
    ]

    return (
        <>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Textarea
                    id="text"
                    name="text"
                    placeholder="Plak hier je recepttekst"
                    className="min-h-[100px]"
                />
                {error && <div className="text-sm text-red-500">{error}</div>}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Toevoegen..." : "Toevoegen"}
                    </Button>
                </div>
            </form>
            {isLoading && <ProgressModal progressSteps={progressSteps} loop={true} />}
        </>
    )
}

export function TextDialog({ open, onOpenChange, onSubmit }: TextDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="top-[40%]">
                <DialogHeader>
                    <DialogTitle>Importeer via tekst</DialogTitle>
                    <DialogDescription>
                        Plak de tekst van een recept en we proberen het automatisch te importeren.
                    </DialogDescription>
                </DialogHeader>
                <TextForm onSubmit={onSubmit} />
            </DialogContent>
        </Dialog>
    )
}
