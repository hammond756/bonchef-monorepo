"use client"

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils"
import { Home, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import Link from "next/link";

interface TabBarProps {
  children?: React.ReactNode;
  className?: string;
}

export function TabBar({ children, className }: TabBarProps) {
    const pathname = usePathname()
    const { isVisible } = useScrollDirection()

    const defaultContent = (
        <>
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
                isVisible ? "translate-y-0" : "translate-y-full"
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
        </>
    )

    return (
        <>
            {/* Spacer to prevent content overlap */}
            <div 
                className="tabbar-spacer"
                style={{
                    height: 'calc(80px + env(safe-area-inset-bottom))',
                }}
            />
            
            {/* Fixed positioned tab bar */}
            <nav
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200',
                    'transition-transform duration-300 ease-in-out',
                    'safe-area-bottom shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]',
                    isVisible ? 'translate-y-0' : 'translate-y-full',
                    className
                )}
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                <div className="px-2 py-2 flex items-center justify-around min-h-[80px]">
                    {children || defaultContent}
                </div>
            </nav>
        </>
    )
}