"use client"

import { cn } from "@/lib/utils"

interface ValidationErrorHeaderProps {
    errors: Record<string, string | undefined>
    className?: string
}

export function ValidationErrorHeader({ errors, className }: Readonly<ValidationErrorHeaderProps>) {
    const validErrors = Object.entries(errors)
        .filter(([_, error]) => error)
        .map(([field, error]) => ({ field, error: error! }))

    if (validErrors.length === 0) return null

    // Separate imageGeneration errors from other errors
    const imageGenerationError = validErrors.find(({ field }) => field === "imageGeneration")
    const otherErrors = validErrors.filter(({ field }) => field !== "imageGeneration")

    // Map field names to error keys for highlighting input fields
    const _errorFieldMap: Record<string, string> = {
        title: "title",
        cookingTime: "total_cook_time_minutes",
        servings: "n_portions",
        description: "description",
        ingredients: "ingredients",
        steps: "instructions",
        image: "thumbnail",
        imageGeneration: "imageGeneration",
    }

    return (
        <>
            {/* Show imageGeneration error with green styling */}
            {imageGenerationError && (
                <div
                    className={cn(
                        "bg-background/80 border-primary/20 sticky top-16 z-40 border-b px-4 py-3 backdrop-blur-sm",
                        className
                    )}
                >
                    <div className="container mx-auto">
                        <div className="flex justify-center">
                            <div>
                                <p className="text-primary text-center text-sm font-medium">
                                    📸 Je kan opslaan als je foto is gegenereerd!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show other validation errors with red styling */}
            {otherErrors.length > 0 && (
                <div
                    className={cn(
                        "bg-background/80 border-destructive/20 sticky top-16 z-40 border-b px-4 py-3 backdrop-blur-sm",
                        className
                    )}
                >
                    <div className="container mx-auto">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="space-y-1">
                                {otherErrors.map(({ field, error }) => (
                                    <p
                                        key={field}
                                        className="text-destructive/80 text-center text-sm"
                                    >
                                        {error}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
