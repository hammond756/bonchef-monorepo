"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ClientBackButton() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleBack = () => {
        const source = searchParams.get("source")
        if (searchParams.get("from") === "edit") {
            router.push(source || "/ontdek")
        } else if (
            typeof window !== "undefined" &&
            window.history.state &&
            window.history.length > 2
        ) {
            router.back()
        } else {
            // Fallback to /ontdek page if no history
            router.push("/ontdek")
        }
    }

    return (
        <Button
            variant="outline-neutral"
            size="icon"
            onClick={handleBack}
            aria-label="Ga terug"
            className="absolute top-4 left-4 z-40 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    )
}
