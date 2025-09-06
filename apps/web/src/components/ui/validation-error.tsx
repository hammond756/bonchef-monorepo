"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationErrorProps {
    error?: string
    className?: string
}

export function ValidationError({ error, className }: ValidationErrorProps) {
    if (!error) return null

    return (
        <div className={cn("text-destructive flex items-center gap-2 text-sm", className)}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
        </div>
    )
}

interface ValidationErrorListProps {
    errors: Record<string, string | undefined>
    className?: string
}

export function ValidationErrorList({ errors, className }: ValidationErrorListProps) {
    const validErrors = Object.entries(errors)
        .filter(([_, error]) => error)
        .map(([field, error]) => ({ field, error: error! }))

    if (validErrors.length === 0) return null

    return (
        <div className={cn("space-y-2", className)}>
            {validErrors.map(({ field, error }) => (
                <ValidationError key={field} error={error} />
            ))}
        </div>
    )
}

interface ValidationFieldWrapperProps {
    error?: string
    children: React.ReactNode
    className?: string
}

export function ValidationFieldWrapper({
    error,
    children,
    className,
}: ValidationFieldWrapperProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {children}
            <ValidationError error={error} />
        </div>
    )
}
