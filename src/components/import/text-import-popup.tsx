"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useRecipeImport } from "@/hooks/use-recipe-import"
import { ImportPopupBase } from "./import-popup-base"

interface TextImportPopupProps {
    isOpen: boolean
    onClose: () => void
}

export function TextImportPopup({ isOpen, onClose }: Readonly<TextImportPopupProps>) {
    const [text, setText] = useState("")
    const { isLoading, error, setError, handleSubmit } = useRecipeImport({
        onClose,
    })

    const handleTextSubmit = () => {
        const textToSubmit = text.trim()
        if (!textToSubmit) {
            setError("Voer wat tekst in.")
            return
        }
        void handleSubmit("text", textToSubmit)
    }

    return (
        <ImportPopupBase
            isOpen={isOpen}
            onClose={onClose}
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
                disabled={isLoading}
            />
        </ImportPopupBase>
    )
}
