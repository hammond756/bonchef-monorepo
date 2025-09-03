import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PhotoDisplayProps {
    photo: {
        id: string
        dataUrl: string
        file: File
    }
    onBack: () => void
}

/**
 * Displays the captured photo with a back button overlay
 * Pure UI component that receives all data and callbacks via props
 */
export function PhotoDisplay({ photo, onBack }: Readonly<PhotoDisplayProps>) {
    return (
        <div className="relative w-full">
            <div className="aspect-square w-full">
                <img
                    src={photo.dataUrl}
                    alt="Captured dish"
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Back button overlay on top of photo */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="absolute top-4 left-4 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-white/20"
                aria-label="Terug"
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </div>
    )
}
