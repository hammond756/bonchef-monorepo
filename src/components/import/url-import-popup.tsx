"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRecipeImport } from "@/hooks/use-recipe-import"
import { ImportPopupBase } from "./import-popup-base"

interface UrlImportPopupProps {
    isOpen: boolean
    onClose: () => void
}

function isValidUrl(string: string) {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}

export function UrlImportPopup({ isOpen, onClose }: Readonly<UrlImportPopupProps>) {
    const [url, setUrl] = useState("")
    const { isLoading, error, setError, handleSubmit } = useRecipeImport({
        onClose,
    })

    const handleUrlSubmit = () => {
        setError(null)

        let urlToSubmit = url.trim()
        if (!urlToSubmit) {
            setError("Voer een URL in.")
            return
        }

        if (!/^(https?:\/\/)/i.test(urlToSubmit)) {
            urlToSubmit = `https://${urlToSubmit}`
        }

        if (!isValidUrl(urlToSubmit)) {
            setError("De ingevoerde URL is ongeldig.")
            return
        }

        void handleSubmit("url", urlToSubmit)
    }

    return (
        <ImportPopupBase
            isOpen={isOpen}
            onClose={onClose}
            title="Importeer van Website"
            description="Plak de URL van het recept dat je wilt importeren."
            isLoading={isLoading}
            onSubmit={handleUrlSubmit}
            error={error}
        >
            <Input
                type="url"
                placeholder="https://voorbeeld.com/recept"
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value)
                    setError(null)
                }}
                disabled={isLoading}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleUrlSubmit()
                    }
                }}
            />
        </ImportPopupBase>
    )
}
