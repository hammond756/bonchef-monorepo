"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputWithError } from "@/components/ui/input-with-error"
import { useValidationErrors } from "@/components/recipe/validation-error-context"
import { cn } from "@/lib/utils"

interface Ingredient {
    id: string
    quantity: number
    unit: string
    name: string
}

interface IngredientItemProps {
    ingredient: Ingredient
    onChange: (updates: Partial<Ingredient>) => void
    onDelete: () => void
    index: number
    className?: string
}

export function IngredientItem({
    ingredient,
    onChange,
    onDelete,
    index,
    className,
}: IngredientItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: ingredient.id,
    })
    const { errors } = useValidationErrors()

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Only allow numeric input
        if (/^\d*$/.test(value)) {
            const numValue = parseInt(value) || 0
            onChange({ quantity: numValue })
        }
    }

    const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ unit: e.target.value })
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ name: e.target.value })
    }

    // Check if this ingredient has validation errors
    const hasIngredientError =
        errors.ingredients && ingredient.name && ingredient.name.trim().length === 0

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                // Prevent text selection and improve mobile drag
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                touchAction: "pan-y",
            }}
            className={cn(
                "bg-background flex flex-col gap-3 rounded-lg border p-3 transition-all",
                // Prevent text selection during drag
                "touch-manipulation select-none",
                isDragging && "z-50 scale-105 opacity-50 shadow-lg",
                className
            )}
            data-ingredient-id={ingredient.id}
            data-ingredient-index={index}
        >
            {/* Top Row: Quantity, Unit, and Delete Button */}
            <div className="flex items-center justify-between gap-3">
                {/* Drag Handle - Larger for mobile */}
                <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md",
                        "cursor-grab touch-manipulation select-none",
                        "hover:bg-muted active:cursor-grabbing",
                        "md:h-8 md:w-8", // Smaller on desktop
                        isDragging && "cursor-grabbing"
                    )}
                    style={{
                        touchAction: "none",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                    }}
                >
                    <GripVertical
                        className="text-muted-foreground h-5 w-5 md:h-4 md:w-4"
                        aria-label={`Sleep hendel voor ingrediënt ${ingredient.name}`}
                    />
                </div>

                {/* Quantity Input */}
                <InputWithError
                    type="text"
                    value={ingredient.quantity || ""}
                    onChange={handleQuantityChange}
                    placeholder="Aantal"
                    className="w-20 bg-gray-50"
                    style={{ userSelect: "text", touchAction: "auto" }}
                    onFocus={(e) => e.stopPropagation()}
                />

                {/* Unit Input */}
                <InputWithError
                    type="text"
                    value={ingredient.unit}
                    onChange={handleUnitChange}
                    placeholder="Eenheid"
                    className="w-24 bg-gray-50"
                    style={{ userSelect: "text", touchAction: "auto" }}
                    onFocus={(e) => e.stopPropagation()}
                />

                {/* Delete Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive h-auto p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Bottom Row: Ingredient Name (Full Width) */}
            <div className="w-full">
                <InputWithError
                    type="text"
                    value={ingredient.name}
                    onChange={handleNameChange}
                    placeholder="Ingrediënt"
                    className="w-full bg-gray-50"
                    style={{ userSelect: "text", touchAction: "auto" }}
                    onFocus={(e) => e.stopPropagation()}
                    error={hasIngredientError ? "Ingrediënt naam is verplicht" : undefined}
                    autoFocus={ingredient.name.trim() === ""}
                />
            </div>
        </div>
    )
}
