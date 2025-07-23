"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useRecipeImport } from "@/hooks/use-recipe-import"
import { ImportPopupBase } from "./import-popup-base"

interface TextImportPopupProps {
    onDismiss: () => void
    onSubmit: () => void
}

export function TextImportPopup({ onDismiss, onSubmit }: Readonly<TextImportPopupProps>) {
    const [text, setText] = useState("")
    const { isLoading, error, setError, handleSubmit } = useRecipeImport()

    const handleTextSubmit = async () => {
        const textToSubmit = text.trim()
        if (!textToSubmit) {
            setError("Voer wat tekst in.")
            return
        }
        void handleSubmit("text", textToSubmit, onSubmit)
        setText("")
    }

    return (
        <ImportPopupBase
            onClose={onDismiss}
            title="Importeer van Tekst"
            description="Plak de tekst van het recept dat je wilt importeren."
            isLoading={isLoading}
            onSubmit={handleTextSubmit}
            error={error}
        >
            <Textarea
                placeholder="Begin hier met het plakken van je recept..."
                className="h-32"
                value={text}
                onChange={(e) => {
                    setText(e.target.value)
                    setError(null)
                }}
            />
        </ImportPopupBase>
    )
}
