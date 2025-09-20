"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SourceFieldProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    maxLength?: number
    error?: string
}

export function SourceField({
    value,
    onChange,
    placeholder = "Bijv. Oma's kookboek, AllRecipes.com, etc.",
    className,
    maxLength = 200,
    error,
}: SourceFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if (newValue.length <= maxLength) {
            onChange(newValue)
        }
    }

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-foreground text-sm font-medium">Bron van het recept</label>
            <div className="relative">
                <Input
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="h-12"
                    maxLength={maxLength}
                />
                {!!maxLength && (
                    <div className="text-muted-foreground absolute right-2 bottom-2 text-xs">
                        {value.length}/{maxLength}
                    </div>
                )}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    )
}
