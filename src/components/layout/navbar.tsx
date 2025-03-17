"use client"

import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { LogOut, LogIn } from "lucide-react"
import { logout } from "@/app/actions"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          {user && (
            <Link 
              href="/collection" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Collectie
            </Link>
          )}
          <Link 
            href="/ontdek" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ontdek
          </Link>
          {user && (
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Chat
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <form action={logout}>
                <button type="submit" className="cursor-pointer" data-testid="logout-button">
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 