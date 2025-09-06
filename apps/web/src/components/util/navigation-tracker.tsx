"use client"

import { useNavigationStore } from "@/lib/store/navigation-store"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function NavigationTracker({ path }: { path?: string }) {
    const push = useNavigationStore((state) => state.push)
    const history = useNavigationStore((state) => state.history)
    const pathname = usePathname()
    const actualPath = path || pathname

    useEffect(() => {
        if (history.at(-1) === actualPath) return
        push(actualPath)
    }, [actualPath, push, history])

    return null
}
