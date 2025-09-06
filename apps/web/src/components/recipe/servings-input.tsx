"use client"

import { Users } from "lucide-react"
import { InputWithError } from "@/components/ui/input-with-error"
import { useValidationErrors } from "@/components/recipe/validation-error-context"
import { cn } from "@/lib/utils"

interface ServingsInputProps {
    value: number
    onChange: (value: number) => void
    className?: string
    placeholder?: string
}

export function ServingsInput({
    value,
    onChange,
    className,
    placeholder = "vul hier de portiegrootte in",
}: ServingsInputProps) {
    const { errors } = useValidationErrors()
    const servingsError = errors.servings

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        // Only allow numeric input
        if (/^\d*$/.test(inputValue)) {
            const numValue = parseInt(inputValue) || 0
            onChange(numValue)
        }
    }

    return (
        <div className={cn("relative", className)}>
            <Users className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <InputWithError
                type="text"
                value={value || ""}
                onChange={handleChange}
                placeholder={placeholder}
                className="h-12 pr-4 pl-10"
                inputMode="numeric"
                pattern="[0-9]*"
                error={servingsError}
            />
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                personen
            </span>
        </div>
    )
}
