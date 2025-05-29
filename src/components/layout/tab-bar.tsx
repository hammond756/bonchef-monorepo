"use client"

import { Bookmark } from "lucide-react";

import { cn } from "@/lib/utils"
import { Home, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { useNavigationVisibility } from "@/hooks/use-navigation-visibility"
import Link from "next/link";

export function TabBar() {
    const pathname = usePathname()
    const shouldHideNavigation = useNavigationVisibility()

    const pagesWithBottomBar = ["/collection", "/ontdek", "/import"]

    if (!pagesWithBottomBar.includes(pathname)) {
        return null
    }

    return (
        <div 
        className={cn(
          "sticky bottom-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around px-2 h-20 shrink-0 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out",
          shouldHideNavigation ? "translate-y-full" : "translate-y-0"
        )}
      >
        <Link
          href="/ontdek"
          className={cn(
            "flex flex-col items-center justify-center text-slate-700 hover:text-green-600 transition-colors w-1/4 pt-1 pb-2 rounded-lg hover:bg-slate-50",
            pathname === "/ontdek" && "bg-green-100 text-green-700",
          )}
        >
          <Home className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Feed</span>
        </Link>

        <div className={cn(
          "w-1/4 flex justify-center items-center -mt-8 transition-transform duration-300 ease-in-out",
          shouldHideNavigation ? "translate-y-full" : "translate-y-0"
        )}>
          <Link
            href="/import"
            className="bg-green-700 hover:bg-green-800 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105"
            aria-label="Importeer recept"
          >
            <Plus className="h-8 w-8" />
          </Link>
        </div>

        <Link
          href="/collection"
          className={cn(
            "flex flex-col items-center justify-center text-slate-700 hover:text-green-600 transition-colors w-1/4 pt-1 pb-2 rounded-lg hover:bg-slate-50",
            pathname === "/collection" && "bg-green-100 text-green-700",
          )}
        >
          <Bookmark className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Collectie</span>
        </Link>
      </div>
    )
}