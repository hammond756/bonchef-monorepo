"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions"
import Link from "next/link"

interface NavbarProps {
  user: User | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.refresh()
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <span className="text-lg font-semibold"><Link href="/">Bonchef</Link></span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
} 