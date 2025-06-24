"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const actionButtonVariants = cva(
    "group flex items-center justify-center rounded-full transition-all duration-200 ease-in-out",
    {
        variants: {
            theme: {
                light: "bg-surface/80 hover:bg-surface",
                dark: "bg-overlay-dark/60 hover:bg-overlay-dark/80",
            },
            size: {
                sm: "h-8 w-8",
                md: "h-10 w-10",
                lg: "h-12 w-12",
            },
        },
        defaultVariants: {
            theme: "light",
            size: "md",
        },
    }
)

const iconVariants = cva("transition-all duration-200 ease-in-out group-hover:scale-110", {
    variants: {
        size: {
            sm: "h-4 w-4",
            md: "h-5 w-5",
            lg: "h-6 w-6",
        },
    },
    defaultVariants: {
        size: "md",
    },
})

const textVariants = cva("text-xs font-medium text-white drop-shadow-sm", {
    variants: {
        size: {
            sm: "mt-0.5",
            md: "mt-1",
            lg: "mt-1",
        },
    },
    defaultVariants: {
        size: "md",
    },
})

export interface ActionButtonProps
    extends VariantProps<typeof actionButtonVariants>,
        VariantProps<typeof textVariants> {
    icon: LucideIcon
    label?: string
    onClick?: (e: React.MouseEvent) => void
    disabled?: boolean
    className?: string
    iconClassName?: string
    "aria-label": string
}

export function ActionButton({
    size,
    theme,
    icon: Icon,
    label,
    onClick,
    disabled,
    className,
    iconClassName,
    "aria-label": ariaLabel,
}: ActionButtonProps) {
    return (
        <div className="flex flex-col items-center space-y-1">
            <button
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel}
                data-testid={`action-button-${ariaLabel.toLowerCase().replace(/\s/g, "-")}`}
                className={cn(actionButtonVariants({ size, theme }), className)}
            >
                <Icon className={cn(iconVariants({ size }), iconClassName)} />
            </button>

            {label && <div className={cn(textVariants({ size }))}>{label}</div>}
        </div>
    )
}
