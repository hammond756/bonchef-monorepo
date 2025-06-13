"use client"

import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UrlStatus {
    url: string
    status: "loading" | "success" | "error"
    content?: string
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
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                    data-testid="url-preview"
                >
                    {url.status === "loading" && (
                        <Loader2
                            className="h-4 w-4 animate-spin"
                            data-testid="url-loading-spinner"
                        />
                    )}
                    {url.status === "success" && (
                        <Check className="h-4 w-4 text-green-500" data-testid="url-checkmark" />
                    )}
                    {url.status === "error" && (
                        <X className="h-4 w-4 text-red-500" data-testid="url-error" />
                    )}
                    <span className="truncate" data-testid="url-preview-text">
                        {url.url}
                    </span>
                </div>
            ))}
        </div>
    )
}
