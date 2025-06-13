"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackButton() {
    const router = useRouter()

    const handleBack = () => {
        // Check if there's a history to go back to
        if (typeof window !== "undefined" && window.history.state && window.history.length > 2) {
            router.back()
        } else {
            // Fallback to /discover page if no history
            router.push("/ontdek")
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Ga terug"
            className="absolute top-4 left-4 z-[100] h-10 w-10 rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-green-700 hover:shadow-lg"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    )
}
