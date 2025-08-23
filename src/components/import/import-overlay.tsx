"use client"

import { Camera, FileText, Link as LinkIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ImportMode } from "@/lib/types"
import { SlideInOverlay } from "@/components/ui/slide-in-overlay"

interface ImportOverlayProps {
    isOpen: boolean
    onClose: () => void
    onSelectMode: (mode: ImportMode) => void
}

export function ImportOverlay({ isOpen, onClose, onSelectMode }: ImportOverlayProps) {
    const router = useRouter()

    const handleDishcoveryClick = () => {
        onClose()
        router.push("/dishcovery")
    }

    return (
        <SlideInOverlay isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <div className="flex items-center justify-between border-b pb-3">
                    <h2 className="text-lg font-semibold">Recept importeren</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Sluiten">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 py-6">
                    <button
                        onClick={() => onSelectMode("photo")}
                        className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-orange-100 p-4 text-center text-orange-800 transition-colors hover:bg-orange-200"
                        aria-label="Foto"
                    >
                        <Camera className="h-8 w-8" />
                        <span className="text-sm font-medium">Scan</span>
                    </button>
                    <button
                        onClick={() => onSelectMode("url")}
                        className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-blue-100 p-4 text-center text-blue-800 transition-colors hover:bg-blue-200"
                        aria-label="Website"
                    >
                        <LinkIcon className="h-8 w-8" />
                        <span className="text-sm font-medium">Website</span>
                    </button>
                    <button
                        onClick={() => onSelectMode("text")}
                        className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-purple-100 p-4 text-center text-purple-800 transition-colors hover:bg-purple-200"
                        aria-label="Notitie"
                    >
                        <FileText className="h-8 w-8" />
                        <span className="text-sm font-medium">Notitie</span>
                    </button>
                </div>
                <div className="relative mb-6 flex items-center justify-center">
                    <span className="bg-surface text-muted-foreground z-10 px-2 text-sm">of</span>
                    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 border-t"></div>
                </div>
                <button
                    onClick={handleDishcoveryClick}
                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-100 p-4 text-center text-green-800 transition-colors hover:bg-green-200"
                >
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    </svg>
                    <span className="text-sm font-medium">Dishcovery</span>
                </button>

                {/* Extra whitespace for better spacing */}
                <div className="h-8"></div>
            </div>
        </SlideInOverlay>
    )
}
