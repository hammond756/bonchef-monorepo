"use client"

import { Share2Icon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { lightThemeClasses, darkThemeClasses } from "@/components/recipe/action-button-variants"

const buttonVariants = cva("flex items-center justify-center rounded-full transition-colors", {
    variants: {
        theme: {
            light: lightThemeClasses,
            dark: darkThemeClasses,
        },
        size: {
            md: "h-10 w-10",
            lg: "h-12 w-12",
        },
    },
    defaultVariants: {
        theme: "light",
        size: "lg",
    },
})

const iconVariants = cva("", {
    variants: {
        size: {
            md: "h-5 w-5",
            lg: "h-6 w-6",
        },
    },
    defaultVariants: {
        size: "lg",
    },
})

const textVariants = cva("text-xs font-medium text-white drop-shadow-sm")

export interface ShareRecipeButtonProps extends VariantProps<typeof buttonVariants> {
    title: string
    text: string
    className?: string
}

export function ShareRecipeButton({ title, text, className, theme, size }: ShareRecipeButtonProps) {
    const { toast } = useToast()

    const handleShare = async () => {
        const shareData = {
            title: title,
            text: text,
            url: window.location.href,
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Fout bij delen:", error)
                    toast({
                        title: "Fout bij delen",
                        description: "Kon het recept niet delen. Probeer het later opnieuw.",
                        variant: "destructive",
                    })
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href)
                toast({
                    title: "Link gekopieerd!",
                    description: "De link naar het recept is naar je klembord gekopieerd.",
                })
            } catch {
                toast({
                    title: "Delen niet ondersteund",
                    description:
                        "Je browser ondersteunt deze deelfunctie niet en de link kon niet worden gekopieerd.",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <div className="flex flex-col items-center">
            <button
                className={cn(buttonVariants({ theme, size }), className)}
                onClick={handleShare}
                aria-label="Deel recept"
            >
                <Share2Icon className={cn(iconVariants({ size }))} />
            </button>
            <span className={cn(textVariants())}>Delen</span>
        </div>
    )
}
