"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { BackButton } from "@/components/ui/back-button"

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

    return <BackButton handleBack={handleBack} />
}
