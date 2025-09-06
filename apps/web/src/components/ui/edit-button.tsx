"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditButtonProps {
    onClick?: () => void
}

export function EditButton({ onClick }: EditButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant="outline-accent"
            size="icon"
            aria-label="Bewerk profiel"
            className="h-10 w-10 rounded-full"
        >
            <Settings className="h-5 w-5" />
        </Button>
    )
}
