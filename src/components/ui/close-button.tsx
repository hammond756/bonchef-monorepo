import { X } from "lucide-react"
import { Button } from "./button"

export function CloseButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            className="h-10 w-10 text-white hover:bg-white/20"
            variant="ghost"
            size="icon"
            onClick={onClick}
            aria-label="Sluiten"
        >
            <X className="h-5 w-5" />
        </Button>
    )
}
