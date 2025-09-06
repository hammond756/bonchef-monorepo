"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { claimRecipe } from "@/app/signup/actions"
import { useToast } from "@/hooks/use-toast"
import { usePostHog } from "posthog-js/react"
import { associateOnboardingData } from "@/app/signup/actions"

export default function AuthCallbackPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const posthog = usePostHog()

    async function handleClaimRecipe(): Promise<boolean> {
        // Check localStorage for claimRecipeId
        let claimRecipeId: string | null = null
        if (typeof window !== "undefined") {
            claimRecipeId = localStorage.getItem("claimRecipeId")
        }
        if (claimRecipeId) {
            try {
                const { success, error: claimError } = await claimRecipe(claimRecipeId)
                if (typeof window !== "undefined") {
                    localStorage.removeItem("claimRecipeId")
                }
                if (success) {
                    router.push(`/collection`)
                    return true
                }
                if (claimError) {
                    console.error("Error claiming recipe:", claimError)
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Er ging iets mis bij het claimen van het recept.",
                    })
                }
            } catch (claimErr) {
                posthog?.captureException(claimErr)
                console.error("Exception while claiming recipe:", claimErr)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Er is iets misgegaan bij het claimen van het recept.",
                })
            }
        }
        return false
    }

    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        const processAuth = async () => {
            try {
                // Get the supabase client
                const supabase = createClient()

                // Explicitly refresh the session to ensure the auth state is updated
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.refreshSession()

                if (sessionError) {
                    throw sessionError
                }

                // Identify the user with PostHog
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (user) {
                    posthog?.identify(user.id, {
                        email: user.email,
                    })
                }

                if (!session) {
                    // Fall back to getSession if refresh didn't work
                    const {
                        data: { session: fallbackSession },
                        error: fallbackError,
                    } = await supabase.auth.getSession()

                    if (fallbackError || !fallbackSession) {
                        throw new Error("No session found")
                    }
                } else {
                    setIsAuthenticated(true)
                }

                // Wait a brief moment to ensure auth state is properly propagated
                timeoutId = setTimeout(async () => {
                    const alternativeRedirect = await handleClaimRecipe()

                    if (user) {
                        const { success } = await associateOnboardingData(user.id)
                        if (!success) {
                            console.error("Error associating onboarding data")
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Er is iets misgegaan bij het koppelen van je data.",
                            })
                        }
                    }

                    // Redirect to home page after successful authentication
                    if (!alternativeRedirect) {
                        router.push("/")
                    }
                }, 800)
            } catch (err) {
                posthog?.captureException(err)
                console.error("Auth error:", err)
                setError(err instanceof Error ? err.message : "Authentication failed")
            } finally {
                setIsLoading(false)
            }
        }

        processAuth()

        return () => {
            console.log("Clearing timeout in auth callback", timeoutId)
            clearTimeout(timeoutId)
        }
    }, [router, toast, posthog])

    return (
        <div className="flex flex-1 items-center justify-center">
            {isLoading ? (
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold">Afronden...</h2>
                    <p className="text-muted-foreground text-sm">
                        Wacht even terwijl we je inloggen
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-red-600">Inloggen mislukt</h2>
                    <p className="text-muted-foreground text-sm">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="bg-primary hover:bg-primary/80 mt-4 rounded px-4 py-2 text-white"
                    >
                        Terug naar inloggen
                    </button>
                </div>
            ) : isAuthenticated ? (
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-green-600">Inloggen gelukt!</h2>
                    <p className="text-muted-foreground text-sm">
                        Je wordt doorgestuurd naar de applicatie...
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
