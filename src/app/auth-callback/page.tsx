"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { claimRecipe } from "@/app/signup/actions"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipeToClaimId = searchParams.get("claimRecipe")
  const { toast } = useToast()

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the supabase client
        const supabase = createClient()
        
        // Explicitly refresh the session to ensure the auth state is updated
        const { data: { session }, error: sessionError } = await supabase.auth.refreshSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          // Fall back to getSession if refresh didn't work
          const { data: { session: fallbackSession }, error: fallbackError } = 
            await supabase.auth.getSession()
            
          if (fallbackError || !fallbackSession) {
            throw new Error("No session found")
          }
        } else {
          setIsAuthenticated(true)
        }


        // Wait a brief moment to ensure auth state is properly propagated
        setTimeout(async () => {
          // If there's a recipe to claim, try to claim it
          if (recipeToClaimId) {
            try {
              const { success, error: claimError } = await claimRecipe(recipeToClaimId)
              
              if (success) {
                // Redirect to the claimed recipe
                router.push(`/collection`)
                return
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
              console.error("Error claiming recipe:", claimErr)
              toast({
                variant: "destructive",
                title: "Error",
                description: "Er is iets misgegaan bij het claimen van het recept.",
              })
            }
          }
          // Redirect to home page after successful authentication
          router.push("/")
        }, 800)
      } catch (err) {
        console.error("Auth error:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
      } finally {
        setIsLoading(false)
      }
    }

    processAuth()
  }, [router, recipeToClaimId, toast])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {isLoading ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Afronden...</h2>
          <p className="text-sm text-muted-foreground">Wacht even terwijl we je inloggen</p>
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Inloggen mislukt</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Terug naar inloggen
          </button>
        </div>
      ) : isAuthenticated ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-green-600">Inloggen gelukt!</h2>
          <p className="text-sm text-muted-foreground">Je wordt doorgestuurd naar de applicatie...</p>
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </div>
      ) : null}
    </div>
  )
} 