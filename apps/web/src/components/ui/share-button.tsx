"use client"

import { Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { lightThemeClasses, darkThemeClasses } from "@/components/recipe/action-button-variants"

const buttonVariants = cva(
    "group flex items-center justify-center rounded-full transition-all duration-200 ease-in-out",
    {
        variants: {
            theme: {
                light: lightThemeClasses,
                dark: darkThemeClasses,
            },
            size: {
                md: "h-10 w-10",
                lg: "h-12 w-12",
            },
            border: {
                true: "ring-1 ring-inset ring-border",
                false: "",
            },
        },
        defaultVariants: {
            theme: "light",
            size: "lg",
            border: false,
        },
    }
)

const iconVariants = cva("group-hover:scale-110 transition-all duration-200 ease-in-out", {
    variants: {
        size: {
            md: "h-5 w-5",
            lg: "h-6 w-6",
        },
    },
    defaultVariants: {
        size: "md",
    },
})

interface ShareButtonProps extends VariantProps<typeof buttonVariants> {
    onClick: () => void
    className?: string
    "aria-label"?: string
    showText?: boolean
    text?: string
}

export function ShareButton({
    onClick,
    className,
    "aria-label": ariaLabel = "Deel",
    showText = false,
    text = "Delen",
    theme,
    size,
    border,
}: ShareButtonProps) {
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onClick}
                aria-label={ariaLabel}
                className={cn(buttonVariants({ theme, size, border }), className)}
            >
                <Share2 className={cn(iconVariants({ size }))} />
            </button>
            {showText && (
                <span className="mt-1 text-xs font-medium text-white drop-shadow-sm">{text}</span>
            )}
        </div>
    )
}
