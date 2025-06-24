"use client"

import { Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface ShareButtonProps {
    shareData: {
        title: string
        text: string
        url: string // This will now be a relative URL like `/profiles/slug`
    }
}

export function ShareButton({ shareData }: ShareButtonProps) {
    const { toast } = useToast()

    const handleShare = async () => {
        const fullUrl = `${window.location.origin}${shareData.url}`
        const finalShareData = {
            ...shareData,
            url: fullUrl,
        }

        if (navigator.share) {
            try {
                await navigator.share(finalShareData)
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    toast({
                        title: "Er is iets misgegaan",
                        description: "Kon de inhoud niet delen.",
                        variant: "destructive",
                    })
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(finalShareData.url)
                toast({
                    title: "Gekopieerd!",
                    description: "De link is naar je klembord gekopieerd.",
                })
            } catch (_error) {
                toast({
                    title: "Er is iets misgegaan",
                    description: "Kon de link niet naar je klembord kopiëren.",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <Button
            variant="outline-blue-accent"
            size="icon"
            onClick={handleShare}
            aria-label="Deel profiel"
            className="h-10 w-10 rounded-full"
        >
            <Share2 className="h-5 w-5" />
        </Button>
    )
}
