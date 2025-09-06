import { ArrowLeft } from "lucide-react"
import { Button } from "./button"

export function BackButton({ handleBack }: { handleBack: () => void }) {
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
