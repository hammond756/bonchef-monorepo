"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
    text?: string
}

const Separator = React.forwardRef<
    React.ElementRef<typeof SeparatorPrimitive.Root>,
    SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, text, ...props }, ref) => {
    if (text && orientation === "horizontal") {
        return (
            <div className="flex w-full items-center gap-3">
                <SeparatorPrimitive.Root
                    ref={ref}
                    decorative={decorative}
                    orientation={orientation}
                    className={cn("bg-border flex-1 shrink-0", "h-px", className)}
                    {...props}
                />
                <span className="text-muted-foreground shrink-0 text-sm">{text}</span>
                <SeparatorPrimitive.Root
                    decorative={decorative}
                    orientation={orientation}
                    className={cn("bg-border flex-1 shrink-0", "h-px", className)}
                    {...props}
                />
            </div>
        )
    }

    return (
        <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
                "bg-border shrink-0",
                orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
                className
            )}
            {...props}
        />
    )
})
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
