"use client" // Mark BaseLayout as a client component

import { Suspense } from "react"
import { ClientBackButton } from "@/components/ui/client-back-button"

interface BaseLayoutProps {
    children: React.ReactNode
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
    return (
        <div className="relative flex min-h-screen flex-col bg-slate-50">
            <Suspense fallback={null}>
                <ClientBackButton />
            </Suspense>

            <main className="flex flex-1 flex-col justify-center">{children}</main>
        </div>
    )
}
