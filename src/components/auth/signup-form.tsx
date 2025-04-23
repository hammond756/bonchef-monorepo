"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { signup } from "@/app/signup/actions"
import { createClient } from "@/utils/supabase/client"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const recipeToClaimId = searchParams.get("claimRecipe")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const displayName = formData.get("displayName") as string

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wachtwoorden komen niet overeen",
      })
      setIsLoading(false)
      return
    }

    try {
      const { success, error } = await signup(email, password, displayName)

      if (success) {
        toast({
          title: "Account is succesvol aangemaakt",
          description: success,
        })
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Pass the recipe ID through to auth-callback if it exists
          let callbackUrl = "/auth-callback"

          if (recipeToClaimId) {
            callbackUrl += `?claimRecipe=${recipeToClaimId}`
          }
          
          router.push(callbackUrl)
        }
      }

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        })
      }
    } catch (error) {
      console.error("Error signing up:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Gebruikersnaam</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="John Doe"
          required
        />
        <p className="text-sm text-muted-foreground">
          De naam waaronder je publieke recepten zichtbaar zijn
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Account aanmaken..." : "Account aanmaken"}
      </Button>
      <div className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Heb je al een account? Log dan hier in
        </Link>
      </div>
    </form>
  )
} 