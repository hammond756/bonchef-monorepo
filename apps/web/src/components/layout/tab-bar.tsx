"use client"

import { Bookmark, Home, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ImportOverlay } from "../import/import-overlay"
import { useImportStatusStore } from "@/lib/store/import-status-store"
import { ImportMode } from "@/lib/types"
import { PendingRecipeBadge } from "./pending-recipe-badge"
import { useOnboarding } from "@/hooks/use-onboarding"
import { useSession } from "@/hooks/use-session"

interface TabBarProps {
    children?: React.ReactNode
    className?: string
}

export function TabBar({ children, className }: TabBarProps) {
    const pathname = usePathname()
    const [isImportOverlayVisible, setIsImportOverlayVisible] = useState(false)
    const { openModal: openImportModal } = useImportStatusStore()
    const { openModal: openOnboardingModal } = useOnboarding()
    const { session, isLoading } = useSession()

    const handleOpenOverlay = () => {
        console.log("[trigger-bug] click on '+' button", {
            session: !!session,
            isLoading,
        })
        if (session || isLoading) {
            if (isLoading) {
                console.log("[trigger-bug] session is loading")
            }
            setIsImportOverlayVisible(true)
        } else {
            openOnboardingModal()
        }
    }

    const handleCloseAll = () => {
        setIsImportOverlayVisible(false)
    }

    const handleSelectImportMode = (mode: ImportMode) => {
        setIsImportOverlayVisible(false)
        openImportModal(mode)
    }

    const defaultContent = (
        <>
            <Link
                href="/ontdek"
                className={cn(
                    "text-muted-foreground hover:bg-surface/5 flex w-1/4 flex-col items-center justify-center rounded-lg pb-2 transition-colors",
                    pathname === "/ontdek" ? "bg-status-green-bg text-primary pt-2" : "pt-1"
                )}
                aria-label="Feed"
            >
                <Home className="mb-1 h-6 w-6" />
                <span
                    className={cn("text-xs font-medium", pathname === "/ontdek" && "font-semibold")}
                >
                    Feed
                </span>
            </Link>

            <div className={cn("-mt-8 flex w-1/4 items-center justify-center")}>
                <button
                    onClick={handleOpenOverlay}
                    className="bg-primary hover:bg-primary/90 flex h-16 w-16 transform items-center justify-center rounded-full text-white shadow-lg transition-all duration-150 ease-in-out hover:scale-105"
                    aria-label="Importeer recept"
                >
                    <Plus className="h-8 w-8" />
                </button>
            </div>

            <Link
                href="/collection"
                className={cn(
                    "text-muted-foreground hover:bg-surface/5 flex w-1/4 flex-col items-center justify-center rounded-lg pb-2 transition-colors",
                    pathname === "/collection" ? "bg-status-green-bg text-primary pt-2" : "pt-1"
                )}
                aria-label="Collectie"
            >
                <div className="relative">
                    <Bookmark className="mb-1 h-6 w-6" />
                    <PendingRecipeBadge />
                </div>
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
            <ImportOverlay
                isOpen={isImportOverlayVisible}
                onClose={handleCloseAll}
                onSelectMode={handleSelectImportMode}
            />

            <nav
                className={cn(
                    "border-border bg-surface w-full border-t",
                    "safe-area-bottom shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]",
                    className
                )}
            >
                <div className="flex min-h-[80px] items-center justify-around px-2 py-2">
                    {children || defaultContent}
                </div>
            </nav>
        </>
    )
}
