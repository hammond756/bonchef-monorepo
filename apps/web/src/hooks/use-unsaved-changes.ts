"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface UseUnsavedChangesProps {
    hasUnsavedChanges: boolean
    onBeforeUnload?: () => void
}

export function useUnsavedChanges({ hasUnsavedChanges, onBeforeUnload }: UseUnsavedChangesProps) {
    const router = useRouter()

    // Handle browser back/forward and page refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ""
                onBeforeUnload?.()
            }
        }

        const handlePopState = (e: PopStateEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                const confirmed = window.confirm(
                    "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?"
                )
                if (!confirmed) {
                    // Push the current state back to prevent navigation
                    window.history.pushState(null, "", window.location.href)
                }
            }
        }

        if (hasUnsavedChanges) {
            window.addEventListener("beforeunload", handleBeforeUnload)
            window.addEventListener("popstate", handlePopState)
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            window.removeEventListener("popstate", handlePopState)
        }
    }, [hasUnsavedChanges, onBeforeUnload])

    // Custom navigation function that checks for unsaved changes
    const navigateWithWarning = useCallback(
        (href: string) => {
            if (hasUnsavedChanges) {
                const confirmed = window.confirm(
                    "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?"
                )
                if (confirmed) {
                    router.push(href)
                }
            } else {
                router.push(href)
            }
        },
        [hasUnsavedChanges, router]
    )

    // Custom back function that checks for unsaved changes
    const goBackWithWarning = useCallback(() => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?"
            )
            if (confirmed) {
                router.back()
            }
        } else {
            router.back()
        }
    }, [hasUnsavedChanges, router])

    return {
        navigateWithWarning,
        goBackWithWarning,
    }
}

// Hook for showing a confirmation dialog before navigation
export function useNavigationWarning(hasUnsavedChanges: boolean) {
    const router = useRouter()

    const showNavigationWarning = useCallback(
        (
            message: string = "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?"
        ) => {
            if (hasUnsavedChanges) {
                return window.confirm(message)
            }
            return true
        },
        [hasUnsavedChanges]
    )

    const safeNavigate = useCallback(
        (href: string, message?: string) => {
            if (showNavigationWarning(message)) {
                router.push(href)
            }
        },
        [router, showNavigationWarning]
    )

    const safeGoBack = useCallback(
        (message?: string) => {
            if (showNavigationWarning(message)) {
                router.back()
            }
        },
        [router, showNavigationWarning]
    )

    return {
        showNavigationWarning,
        safeNavigate,
        safeGoBack,
    }
}
