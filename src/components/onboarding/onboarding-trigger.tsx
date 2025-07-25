"use client"

import { useCallback, useEffect } from "react"
import { useOnboarding } from "@/hooks/use-onboarding"
import { usePathname } from "next/navigation"
import { useNavigationStore } from "@/lib/store/navigation-store"
import { useSession } from "@/hooks/use-session"

// This component will be a client-side component responsible for handling
// the logic of when to trigger the onboarding modal.
export function OnboardingTrigger() {
    const { session } = useSession()

    const {
        openModal,
        onboardingSessionId,
        isLoading: isOnboardingLoading,
        initializeSession,
    } = useOnboarding()
    const pathname = usePathname()
    const history = useNavigationStore((state) => state.history)

    // On mount, initialize the onboarding session.
    useEffect(() => {
        initializeSession()
    }, [initializeSession])

    const startOnboardingIn = useCallback(
        (seconds: number) => {
            const timer = setTimeout(() => {
                openModal()
            }, seconds * 1000)
            return () => clearTimeout(timer)
        },
        [openModal]
    )

    const setDurationTrigger = useCallback(() => {
        return startOnboardingIn(2 * 60)
    }, [startOnboardingIn])

    const setCollectionPageTrigger = useCallback(() => {
        if (pathname === "/collection") {
            return startOnboardingIn(1)
        }
    }, [pathname, startOnboardingIn])

    const setDirectRecipePageTrigger = useCallback(() => {
        if (
            pathname === "/ontdek" &&
            history.at(-2)?.startsWith("/recipe/") &&
            history.length === 3
        ) {
            return startOnboardingIn(1)
        }
    }, [pathname, history, startOnboardingIn])

    useEffect(() => {
        if (isOnboardingLoading || session || onboardingSessionId) return

        const cleanupDuration = setDurationTrigger()
        const cleanupCollection = setCollectionPageTrigger()
        const cleanupDirectRecipe = setDirectRecipePageTrigger()

        return () => {
            if (cleanupDuration) cleanupDuration()
            if (cleanupCollection) cleanupCollection()
            if (cleanupDirectRecipe) cleanupDirectRecipe()
        }
    }, [
        session,
        onboardingSessionId,
        isOnboardingLoading,
        setDurationTrigger,
        setCollectionPageTrigger,
        setDirectRecipePageTrigger,
    ])

    return null // This component does not render anything.
}
