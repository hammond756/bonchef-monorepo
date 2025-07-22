"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRecipeImport } from "@/hooks/use-recipe-import"
import { ImportPopupBase } from "./import-popup-base"

function isValidUrl(string: string) {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}

export function UrlImportPopup() {
    const [url, setUrl] = useState("")
    const { isLoading, error, setError, handleSubmit } = useRecipeImport()

    const handleUrlSubmit = async () => {
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

        await handleSubmit("url", urlToSubmit)
        setUrl("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            void handleUrlSubmit()
        }
    }

    return (
        <ImportPopupBase
            title="Importeer van URL"
            description="Plak de URL van het recept dat je wilt importeren."
            isLoading={isLoading}
            onSubmit={handleUrlSubmit}
            error={error}
        >
            <Input
                type="url"
                placeholder="https://website.com/recept"
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value)
                    setError(null)
                }}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
        </ImportPopupBase>
    )
}
