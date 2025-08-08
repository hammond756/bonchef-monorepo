"use client"

import { useNativeShare } from "@/hooks/use-native-share"
import { ShareButton } from "@/components/ui/share-button"
import { trackEvent } from "@/lib/analytics/track"
import { createRecipeSlug } from "@/lib/utils"

interface ShareRecipeButtonProps {
    className?: string
    theme?: "light" | "dark"
    size?: "md" | "lg"
    recipeId: string
    title: string
    shareText: string
}

export function ShareRecipeButton({ className, theme, size, recipeId, title, shareText }: ShareRecipeButtonProps) {
    const fullUrl = `${window.location.origin}/recipes/${createRecipeSlug(title, recipeId)}?utm_medium=share`
    const finalShareData = {
        title,
        text: shareText,
        url: fullUrl,
    }

    const handleShare = useNativeShare(finalShareData)

    const handleShareClick = async () => {
        const method = await handleShare()
        if (method) {
            trackEvent("shared_recipe", {
                method,
                url: fullUrl,
                recipe_id: recipeId,
            })
        }
    }

    return (
        <ShareButton
            onClick={handleShareClick}
            className={className}
            aria-label="Deel recept"
            showText={true}
            text="Delen"
            theme={theme}
            size={size}
        />
    )
}
