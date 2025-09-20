"use client"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface TextareaWithErrorProps extends React.ComponentProps<typeof Textarea> {
    error?: string
    className?: string
}

export function TextareaWithError({
    error,
    className,
    ...props
}: Readonly<TextareaWithErrorProps>) {
    return (
        <Textarea
            {...props}
            className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        />
    )
}
