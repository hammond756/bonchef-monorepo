"use client"

import { Bookmark, Home, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ImportOverlay } from "../import/import-overlay"
import { useImportStatusStore } from "@/lib/store/import-status-store"
import { motion, AnimatePresence } from "framer-motion"
import { ImportMode } from "@/lib/types"
import { useOwnRecipes } from "@/hooks/use-own-recipes"
import { useRecipeImportJobs } from "@/hooks/use-recipe-import-jobs"

interface TabBarProps {
    children?: React.ReactNode
    className?: string
}

export function TabBar({ children, className }: TabBarProps) {
    const pathname = usePathname()
    const [isImportOverlayVisible, setIsImportOverlayVisible] = useState(false)
    const [badgeKey, setBadgeKey] = useState(0) // For triggering animations
    const { recipes } = useOwnRecipes()
    const { jobs } = useRecipeImportJobs()
    const { openModal } = useImportStatusStore()

    // Count recipes that need attention (drafts) + pending imports
    const recipesNeedingAttention = recipes.filter((recipe) => recipe.status === "DRAFT").length
    const pendingImports = jobs.filter((job) => job.status === "pending").length
    const totalCount = recipesNeedingAttention + pendingImports

    // Trigger badge animation when count changes
    useEffect(() => {
        if (totalCount > 0) {
            setBadgeKey((prev) => prev + 1)
        }
    }, [totalCount])

    const handleOpenOverlay = () => {
        setIsImportOverlayVisible(true)
    }

    const handleCloseAll = () => {
        setIsImportOverlayVisible(false)
    }

    const handleSelectImportMode = (mode: ImportMode) => {
        setIsImportOverlayVisible(false)
        openModal(mode)
    }

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
            >
                <div className="relative">
                    <Bookmark className="mb-1 h-6 w-6" />
                    <AnimatePresence mode="wait">
                        {totalCount > 0 && (
                            <motion.span
                                key={badgeKey}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{
                                    scale: [0.8, 1.3, 1],
                                    opacity: 1,
                                }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeOut",
                                    scale: {
                                        times: [0, 0.6, 1],
                                        duration: 0.4,
                                    },
                                }}
                                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                            >
                                {totalCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
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
