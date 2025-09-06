import { Button } from "@/components/ui/button"
import { ImageIcon, CameraIcon } from "lucide-react"

interface CameraControlsProps {
    onCapture: () => void
    onOpenGallery: () => void
    isCapturing?: boolean
    className?: string
}

export function CameraControls({
    onCapture,
    onOpenGallery,
    isCapturing = false,
    className = "",
}: CameraControlsProps) {
    return (
        <div className={`absolute right-0 bottom-6 left-0 z-30 sm:bottom-8 ${className}`}>
            <div className="flex items-center justify-center px-4 sm:px-8">
                {/* Gallery button - fixed width */}
                <div className="flex w-12 justify-start sm:w-16">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onOpenGallery}
                        className="h-10 w-10 border border-blue-200 bg-blue-100 text-blue-800 shadow-sm hover:bg-blue-200 sm:h-12 sm:w-12"
                        aria-label="Galerij"
                    >
                        <ImageIcon className="h-6 w-6" />
                    </Button>
                </div>

                {/* Capture button - centered */}
                <div className="flex flex-1 justify-center">
                    <Button
                        onClick={onCapture}
                        disabled={isCapturing}
                        className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 sm:h-20 sm:w-20"
                        aria-label="Foto maken"
                    >
                        <CameraIcon className="h-8 w-8 text-gray-800 sm:h-10 sm:w-10" />
                    </Button>
                </div>

                {/* Spacer for balance */}
                <div className="w-12 sm:w-16" />
            </div>
        </div>
    )
}
