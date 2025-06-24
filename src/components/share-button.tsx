"use client"

import { Share2Icon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ActionButton, ActionButtonProps } from "@/components/ui/action-button"
import { cn } from "@/lib/utils"

interface ShareRecipeButtonProps {
    title: string
    text: string
    theme?: "light" | "dark"
    size?: ActionButtonProps["size"]
}

export function ShareButton({ title, text, theme, size }: ShareRecipeButtonProps) {
    const { toast } = useToast()

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

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
        <ActionButton
            icon={Share2Icon}
            label="Delen"
            onClick={handleShare}
            aria-label="Deel recept"
            size={size}
            theme={theme}
            iconClassName={cn({
                "text-surface": theme === "dark",
                "text-foreground": theme !== "dark",
            })}
        />
    )
}
