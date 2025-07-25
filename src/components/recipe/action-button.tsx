"use client"

import { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useToast } from "@/hooks/use-toast"
import { cn, formatNumber } from "@/lib/utils"
import { lightThemeClasses, darkThemeClasses } from "@/components/recipe/action-button-variants"
import { useUser } from "@/hooks/use-user"

const actionButtonVariants = cva(
    "group flex items-center justify-center rounded-full transition-all duration-200 ease-in-out",
    {
        variants: {
            theme: {
                light: lightThemeClasses,
                dark: darkThemeClasses,
            },
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-12 w-12",
                xl: "h-14 w-14",
            },
        },
        defaultVariants: {
            theme: "light",
            size: "md",
        },
    }
)

const iconVariants = cva(
    "flex items-center justify-center transition-all duration-200 ease-in-out group-hover:scale-110",
    {
        variants: {
            size: {
                sm: "h-4 w-4",
                md: "h-5 w-5",
                lg: "h-6 w-6",
                xl: "h-7 w-7",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const textVariants = cva("text-xs font-medium text-white drop-shadow-sm")

export interface ActionButtonProps
    extends VariantProps<typeof actionButtonVariants>,
        Omit<VariantProps<typeof textVariants>, "size"> {
    // State props
    isActive: boolean
    count: number
    isLoading?: boolean

    // Action props
    onToggle: () => Promise<{
        success: boolean
        error?: { message: string; code?: number | string | null | unknown } | null
    }>
    onAuthRequired?: () => void

    // Display props
    icon: ReactNode
    showCount?: boolean
    className?: string
    theme?: "light" | "dark"
    size?: "sm" | "md" | "lg" | "xl"
    iconSize?: "sm" | "md" | "lg" | "xl"
    zeroText?: string

    // Accessibility
    activeLabel: string
    inactiveLabel: string
    dataTestId: string
}

export function ActionButton({
    size,
    iconSize,
    isActive,
    count,
    isLoading = false,
    onToggle,
    onAuthRequired,
    icon,
    showCount = true,
    className,
    theme,
    activeLabel,
    inactiveLabel,
    dataTestId,
    zeroText,
}: ActionButtonProps) {
    const { user } = useUser()
    const { toast } = useToast()

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            onAuthRequired?.()
            return
        }

        const result = await onToggle()

        if (!result.success) {
            toast({
                title: "Er is iets misgegaan",
                description: result.error?.message || "Probeer het later opnieuw",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleClick}
                disabled={isLoading}
                aria-label={isActive ? activeLabel : inactiveLabel}
                data-testid={dataTestId}
                className={cn(actionButtonVariants({ size, theme }), className)}
            >
                <div className={cn(iconVariants({ size: iconSize || size }))}>{icon}</div>
            </button>

            {showCount && (
                <span className={cn(textVariants())} data-testid={`${dataTestId}-count`}>
                    {count === 0 && zeroText ? zeroText : formatNumber(count)}
                </span>
            )}
        </div>
    )
}
