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
        (seconds: number, trigger: string) => {
            const timer = setTimeout(() => {
                console.log(`[trigger-bug] Opening onboarding modal from ${trigger}`)
                openModal()
            }, seconds * 1000)
            return () => clearTimeout(timer)
        },
        [openModal]
    )

    const setDurationTrigger = useCallback(() => {
        return startOnboardingIn(2 * 60, "duration")
    }, [startOnboardingIn])

    const setCollectionPageTrigger = useCallback(() => {
        if (pathname === "/collection") {
            return startOnboardingIn(1, "collection")
        }
    }, [pathname, startOnboardingIn])

    const setDirectRecipePageTrigger = useCallback(() => {
        if (
            pathname === "/ontdek" &&
            history.at(-2)?.startsWith("/recipe/") &&
            history.length === 3
        ) {
            return startOnboardingIn(1, "direct-recipe-page")
        }
    }, [pathname, history, startOnboardingIn])

    useEffect(() => {
        if (isOnboardingLoading || session || onboardingSessionId) return

        console.log("[trigger-bug] Setting onboarding triggers", {
            session: !!session,
            onboardingSessionId: !!onboardingSessionId,
            isOnboardingLoading: isOnboardingLoading,
        })

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
