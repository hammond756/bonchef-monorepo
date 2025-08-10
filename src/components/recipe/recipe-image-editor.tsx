"use client"

import { useRef, useState } from "react"
import { Camera, Image as ImageIcon, Sparkles, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface RecipeImageEditorProps {
    imageUrl?: string | null
    recipeTitle?: string
    onImageChange?: (file: File) => void
    onGenerateImage?: () => void
    onTakePhoto?: () => void
    isGenerating?: boolean
    className?: string
}

export function RecipeImageEditor({
    imageUrl,
    recipeTitle,
    onImageChange,
    onGenerateImage,
    onTakePhoto,
    isGenerating = false,
    className,
}: RecipeImageEditorProps) {
    const [isHovered, setIsHovered] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && onImageChange) {
            onImageChange(file)
        }
    }

    const handleCameraClick = () => {
        if (onTakePhoto) {
            onTakePhoto()
        } else {
            // Fallback to file input. Also allows camera on mobile.
            fileInputRef.current?.click()
        }
    }

    const handleGalleryClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div
            data-testid="image-container"
            className={cn(
                "bg-muted relative aspect-[3/4] w-full overflow-hidden rounded-xl",
                className
            )}
            onClick={() => {
                if (!isHovered && !isGenerating) setIsHovered(true)
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !isHovered && !isGenerating) {
                    setIsHovered(true)
                }
            }}
        >
            {/* Recipe Image */}
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={recipeTitle || "Recipe image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            ) : (
                <div className="flex h-full items-center justify-center">
                    <ImageIcon
                        data-testid="image-icon"
                        className="text-muted-foreground h-12 w-12"
                    />
                </div>
            )}

            {/* Spinner overlay while generating */}
            {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="text-surface h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
            )}

            {/* Edit Icon Overlay - Always visible and clickable */}
            <button
                onClick={() => setIsHovered(true)}
                className={cn(
                    "absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition-all",
                    "hover:scale-110 hover:bg-black/90 active:scale-95",
                    "cursor-pointer shadow-lg"
                )}
                aria-label="Foto wijzigen"
            >
                <Edit3 className="h-5 w-5" />
            </button>

            {/* Image Actions Menu - Show when edit button is clicked */}
            {isHovered && !isGenerating && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setIsHovered(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setIsHovered(false)
                        }
                    }}
                    aria-label="Annuleer foto wijzigen"
                >
                    <div
                        className="bg-background flex gap-2 rounded-lg border p-3 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                handleCameraClick()
                                setIsHovered(false)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCameraClick()
                                    setIsHovered(false)
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <Camera className="h-4 w-4" />
                            <span className="text-xs">Foto maken</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                handleGalleryClick()
                                setIsHovered(false)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleGalleryClick()
                                    setIsHovered(false)
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-xs">Galerij</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onGenerateImage?.()
                                setIsHovered(false)
                            }}
                            disabled={isGenerating}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onGenerateImage?.()
                                    setIsHovered(false)
                                }
                            }}
                            className="flex items-center gap-2"
                            aria-label="AI Genereren"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs">
                                {isGenerating ? "Genereren..." : "AI Genereren"}
                            </span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Hidden file input for programmatic access */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="recipe-image-input"
            />
        </div>
    )
}
