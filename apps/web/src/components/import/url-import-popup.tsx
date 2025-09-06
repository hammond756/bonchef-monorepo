"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRecipeImport } from "@/hooks/use-recipe-import"
import { ImportPopupBase } from "./import-popup-base"
import { validateUrlForImport } from "@/lib/services/url-validation-service"
import { InstagramIcon, Link, Music2 } from "lucide-react"

interface UrlImportPopupProps {
    onDismiss: () => void
    onSubmit: () => void
}

function isValidUrl(string: string) {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}

function isVerticalVideoUrl(url: string) {
    return /instagram\.com(.*)\/reel\//.test(url) || /tiktok\.com\//.test(url)
}

export function UrlImportPopup({ onDismiss, onSubmit }: Readonly<UrlImportPopupProps>) {
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

        const sourceType = isVerticalVideoUrl(urlToSubmit) ? "vertical_video" : "url"

        // Validate URL against unsupported sources
        if (sourceType === "url") {
            const validationResult = validateUrlForImport(urlToSubmit)
            if (!validationResult.isValid) {
                setError(validationResult.errorMessage || "Deze URL wordt niet ondersteund.")
                return
            }
        }

        void handleSubmit(sourceType, urlToSubmit, onSubmit)
        setUrl("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            void handleUrlSubmit()
        }
    }

    return (
        <ImportPopupBase
            onClose={onDismiss}
            title="Kopieer en plak een URL"
            isLoading={isLoading}
            onSubmit={handleUrlSubmit}
            error={error}
        >
            <div className="flex flex-col gap-2">
                <ul className="list-inside list-none">
                    <li>
                        <InstagramIcon className="mr-2 inline-block h-4 w-4" />
                        Instagram Reels
                    </li>
                    <li>
                        <Music2 className="mr-2 inline-block h-4 w-4" />
                        TikTok&apos;s
                    </li>
                    <li>
                        <Link className="mr-2 inline-block h-4 w-4" />
                        Webpagina&apos;s
                    </li>
                </ul>
                <p className="mt-4 mb-[-10px] font-semibold">Van pagina of video naar recept ✨</p>
                <p className="">
                    Superslim omgezet. Meestal spot-on, soms een gok die je zelf moet checken.
                </p>
                {/* <ul className="list-none list-inside">
                    <li>
                        <Link className="h-4 w-4 inline-block mr-2" />
                        Webpagina's
                    </li>
                </ul> */}
            </div>
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
                aria-label="URL"
            />
        </ImportPopupBase>
    )
}
