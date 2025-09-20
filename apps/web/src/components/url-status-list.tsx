"use client"

import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UrlStatus {
    url: string
    status: "loading" | "success" | "error"
    content?: string
    errorMessage?: string
}

interface UrlStatusListProps {
    urls: UrlStatus[]
    className?: string
}

export function UrlStatusList({ urls, className }: UrlStatusListProps) {
    if (!urls.length) return null

    return (
        <div className={cn("mb-2 space-y-2", className)}>
            {urls.map((url) => (
                <div
                    key={url.url}
                    className="text-muted-foreground flex items-start gap-2 text-sm"
                    data-testid="url-preview"
                >
                    {url.status === "loading" && (
                        <Loader2
                            className="mt-0.5 h-4 w-4 animate-spin"
                            data-testid="url-loading-spinner"
                        />
                    )}
                    {url.status === "success" && (
                        <Check
                            className="mt-0.5 h-4 w-4 text-green-500"
                            data-testid="url-checkmark"
                        />
                    )}
                    {url.status === "error" && (
                        <X className="mt-0.5 h-4 w-4 text-red-500" data-testid="url-error" />
                    )}
                    <div className="min-w-0 flex-1">
                        <span className="block truncate" data-testid="url-preview-text">
                            {url.url}
                        </span>
                        {url.status === "error" && url.errorMessage && (
                            <span
                                className="mt-1 block text-xs whitespace-pre-line text-red-500"
                                data-testid="url-error-message"
                            >
                                {url.errorMessage}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
