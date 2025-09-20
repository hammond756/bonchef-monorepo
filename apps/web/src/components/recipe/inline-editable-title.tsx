"use client"

import { InputWithError } from "@/components/ui/input-with-error"
import { useValidationErrors } from "@/components/recipe/validation-error-context"
import { cn } from "@/lib/utils"

interface InlineEditableTitleProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    maxLength?: number
}

export function InlineEditableTitle({
    value,
    onChange,
    placeholder = "Recept titel",
    className,
    maxLength = 100,
}: InlineEditableTitleProps) {
    const { errors } = useValidationErrors()
    const titleError = errors.title

    return (
        <div className={cn("relative", className)}>
            <InputWithError
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-12 pr-20 text-lg font-semibold"
                maxLength={maxLength}
                aria-label="Recept titel"
                error={titleError}
            />
            {value && (
                <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                    {value.length}/{maxLength}
                </span>
            )}
        </div>
    )
}
