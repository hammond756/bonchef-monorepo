"use client"

import { LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { usePostHog } from "posthog-js/react"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
    className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
    const posthog = usePostHog()

    const handleLogout = () => {
        posthog.reset()
        const supabase = createClient()
        supabase.auth.signOut()
    }

    return (
        <button
            onClick={handleLogout}
            className={cn(
                "group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ease-in-out",
                "bg-surface/95 text-foreground hover:bg-surface ring-border ring-1 ring-inset",
                className
            )}
            data-testid="logout-button"
            aria-label="Uitloggen"
        >
            <LogOut
                className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110"
                strokeWidth={2}
            />
        </button>
    )
}
