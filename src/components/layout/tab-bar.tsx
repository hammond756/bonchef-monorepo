"use client"

import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { Home, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import Link from "next/link"

interface TabBarProps {
    children?: React.ReactNode
    className?: string
}

export function TabBar({ children, className }: TabBarProps) {
    const pathname = usePathname()
    const { isVisible } = useScrollDirection()

    const defaultContent = (
        <>
            <Link
                href="/ontdek"
                className={cn(
                    "text-muted-foreground hover:bg-surface/5 flex w-1/4 flex-col items-center justify-center rounded-lg pb-2 transition-colors",
                    pathname === "/ontdek" ? "bg-status-green-bg text-primary pt-2" : "pt-1"
                )}
            >
                <Home className="mb-1 h-6 w-6" />
                <span
                    className={cn("text-xs font-medium", pathname === "/ontdek" && "font-semibold")}
                >
                    Feed
                </span>
            </Link>

            <div
                className={cn(
                    "-mt-8 flex w-1/4 items-center justify-center transition-transform duration-300 ease-in-out",
                    isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                <Link
                    href="/import"
                    className="bg-primary hover:bg-primary/90 flex h-16 w-16 transform items-center justify-center rounded-full text-white shadow-lg transition-all duration-150 ease-in-out hover:scale-105"
                    aria-label="Importeer recept"
                >
                    <Plus className="h-8 w-8" />
                </Link>
            </div>

            <Link
                href="/collection"
                className={cn(
                    "text-muted-foreground hover:bg-surface/5 flex w-1/4 flex-col items-center justify-center rounded-lg pb-2 transition-colors",
                    pathname === "/collection" ? "bg-status-green-bg text-primary pt-2" : "pt-1"
                )}
            >
                <Bookmark className="mb-1 h-6 w-6" />
                <span
                    className={cn(
                        "text-xs font-medium",
                        pathname === "/collection" && "font-semibold"
                    )}
                >
                    Collectie
                </span>
            </Link>
        </>
    )

    return (
        <>
            {/* Spacer to prevent content overlap */}
            <div
                className="tabbar-spacer"
                style={{
                    height: "calc(80px + env(safe-area-inset-bottom))",
                }}
            />

            {/* Fixed positioned tab bar */}
            <nav
                className={cn(
                    "border-border bg-surface fixed right-0 bottom-0 left-0 z-50 border-t",
                    "transition-transform duration-300 ease-in-out",
                    "safe-area-bottom shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]",
                    isVisible ? "translate-y-0" : "translate-y-full",
                    className
                )}
                style={{
                    paddingBottom: "env(safe-area-inset-bottom)",
                }}
            >
                <div className="flex min-h-[80px] items-center justify-around px-2 py-2">
                    {children || defaultContent}
                </div>
            </nav>
        </>
    )
}
