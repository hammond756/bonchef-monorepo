"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputWithErrorProps extends React.ComponentProps<typeof Input> {
    error?: string
    className?: string
}

export function InputWithError({ error, className, ...props }: Readonly<InputWithErrorProps>) {
    return (
        <Input
            {...props}
            className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        />
    )
}
