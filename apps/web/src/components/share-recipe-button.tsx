"use client"

import { useNativeShare } from "@/hooks/use-native-share"
import { ShareButton } from "@/components/ui/share-button"
import { trackEvent } from "@/lib/analytics/track"
import { createRecipeSlug } from "@/lib/utils"
import { useState } from "react"
import { useOptionalRecipeState } from "@/hooks/use-recipe-state"
import { StateShareModal } from "@/components/ui/state-share-modal"
import { buildUrlWithState } from "@/lib/utils/recipe-state-encoder"
import { getOrigin } from "@/lib/utils/window"

interface ShareRecipeButtonProps {
    className?: string
    theme?: "light" | "dark"
    size?: "md" | "lg"
    recipeId: string
    title: string
    shareText: string
}

export function ShareRecipeButton({
    className,
    theme,
    size,
    recipeId,
    title,
    shareText,
}: ShareRecipeButtonProps) {
    const fullUrl = `${getOrigin()}/recipes/${createRecipeSlug(title, recipeId)}?utm_medium=share`
    const finalShareData = {
        title,
        text: shareText,
        url: fullUrl,
    }

    const handleShare = useNativeShare(finalShareData)
    const [showStateModal, setShowStateModal] = useState(false)
    const recipeInteractionState = useOptionalRecipeState()

    const handleShareClick = async () => {
        // If the recipe state is dirty and context is present, show the modal
        if (recipeInteractionState && recipeInteractionState.isDirty()) {
            setShowStateModal(true)
            return
        }

        // Otherwise, share the link as is
        const method = await handleShare()
        if (method) {
            trackEvent("shared_recipe", { method, url: fullUrl, recipe_id: recipeId })
        }
    }

    const handleChoose = async (includeState: boolean) => {
        setShowStateModal(false)
        const url =
            includeState && recipeInteractionState
                ? buildUrlWithState(fullUrl, recipeInteractionState.snapshot())
                : fullUrl
        const method = await handleShare({ url })
        if (method) trackEvent("shared_recipe", { method, url, recipe_id: recipeId })
    }

    return (
        <>
            <ShareButton
                onClick={handleShareClick}
                className={className}
                aria-label="Deel recept"
                showText={true}
                text="Delen"
                theme={theme}
                size={size}
            />
            {recipeInteractionState && (
                <StateShareModal
                    open={showStateModal}
                    onOpenChange={setShowStateModal}
                    onChoose={handleChoose}
                />
            )}
        </>
    )
}
