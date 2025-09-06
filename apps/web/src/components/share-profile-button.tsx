"use client"

import { useNativeShare } from "@/hooks/use-native-share"
import { ShareButton } from "@/components/ui/share-button"
import { trackEvent } from "@/lib/analytics/track"
import { createProfileSlug } from "@/lib/utils"

interface ShareProfileButtonProps {
    profileId: string
    displayName: string
    className?: string
}

export function ShareProfileButton({ profileId, displayName, className }: ShareProfileButtonProps) {
    const fullUrl = `${window.location.origin}/profiles/${createProfileSlug(displayName, profileId)}?utm_medium=share`
    const shareData = {
        title: `${displayName} op Bonchef`,
        text: `Bekijk ${displayName} op Bonchef`,
        url: fullUrl,
    }

    const handleShare = useNativeShare(shareData)

    const handleShareClick = async () => {
        const method = await handleShare()
        if (method) {
            trackEvent("shared_profile", {
                method,
                url: fullUrl,
                profile_id: profileId,
            })
        }
    }

    return (
        <ShareButton
            onClick={handleShareClick}
            className={className}
            aria-label="Deel profiel"
            size="md"
            theme="light"
            border={true}
        />
    )
}
