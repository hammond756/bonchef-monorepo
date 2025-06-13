"use client"

import { useState, useMemo } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Separator } from "./ui/separator"
import type { Ingredient } from "@/lib/types"
import { formatIngredientLine } from "@/lib/utils"
import { Checkbox } from "./ui/checkbox" // Importeren van Checkbox

interface IngredientGroup {
    name: string
    ingredients: Ingredient[]
}

interface InteractiveIngredientsListProps {
    ingredientGroups: IngredientGroup[]
    initialServings: number
}

export function InteractiveIngredientsList({
    ingredientGroups,
    initialServings,
}: InteractiveIngredientsListProps) {
    const [currentServings, setCurrentServings] = useState(initialServings || 1)
    const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())

    const servingsMultiplier = useMemo(() => {
        if (!initialServings || initialServings === 0) return 1 // Voorkom delen door nul
        return currentServings / initialServings
    }, [currentServings, initialServings])

    const toggleIngredient = (ingredientId: string) => {
        setCheckedIngredients((prevChecked) => {
            const newChecked = new Set(prevChecked)
            if (newChecked.has(ingredientId)) {
                newChecked.delete(ingredientId)
            } else {
                newChecked.add(ingredientId)
            }
            return newChecked
        })
    }

    // Fallback ID generatie voor ingrediënten zonder expliciete ID
    const getIngredientKey = (groupIndex: number, ingredientIndex: number): string => {
        return `group-${groupIndex}-ingredient-${ingredientIndex}`
    }

    if (!ingredientGroups || ingredientGroups.length === 0) {
        return (
            <Card className="text-muted-foreground p-6 text-center">
                Geen ingrediënten gevonden voor dit recept.
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Portion Calculator */}
            <Card className="rounded-lg bg-[#D4E6DE] p-4">
                <div className="flex items-center justify-between">
                    <span className="text-bonchef-dark text-sm font-medium">Aantal personen</span>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-bonchef-dark h-8 w-8 border-gray-300 bg-white hover:bg-gray-50"
                            onClick={() => setCurrentServings(Math.max(1, currentServings - 1))}
                            aria-label="Verminder aantal personen"
                        >
                            <Minus size={16} />
                        </Button>
                        <span className="text-bonchef-dark w-8 text-center font-semibold">
                            {currentServings}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-bonchef-dark h-8 w-8 border-gray-300 bg-white hover:bg-gray-50"
                            onClick={() => setCurrentServings(currentServings + 1)}
                            aria-label="Verhoog aantal personen"
                        >
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Ingredients List */}
            <Card className="rounded-lg p-6">
                {ingredientGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6 last:mb-0">
                        {group.name !== "no_group" && (
                            <h3 className="mb-3 text-lg font-semibold text-gray-700">
                                {group.name}
                            </h3>
                        )}
                        <ul className="space-y-4">
                            {group.ingredients &&
                                group.ingredients.map((ingredient, ingredientIndex) => {
                                    const ingredientKey = getIngredientKey(
                                        groupIndex,
                                        ingredientIndex
                                    )
                                    const isChecked = checkedIngredients.has(ingredientKey)
                                    const formattedParts = formatIngredientLine(
                                        ingredient,
                                        servingsMultiplier
                                    )

                                    if (!formattedParts || !formattedParts.description) return null

                                    return (
                                        <li
                                            key={ingredientKey}
                                            className={`flex items-center space-x-3 rounded-lg p-3 transition-colors ${
                                                isChecked
                                                    ? "bg-green-50"
                                                    : "hover:bg-bonchef-sage/30"
                                            }`}
                                            role="checkbox"
                                            aria-checked={isChecked}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault()
                                                    toggleIngredient(ingredientKey)
                                                }
                                            }}
                                        >
                                            <Checkbox
                                                id={ingredientKey}
                                                checked={isChecked}
                                                onCheckedChange={() =>
                                                    toggleIngredient(ingredientKey)
                                                }
                                                className="h-5 w-5 text-white data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                                                aria-label={`Markeer ${formattedParts.quantity} ${formattedParts.description} als voltooid`}
                                            />
                                            <label
                                                htmlFor={ingredientKey}
                                                className={`flex-1 cursor-pointer text-base ${
                                                    isChecked
                                                        ? "text-gray-500 line-through"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {formattedParts.quantity && (
                                                    <span className="mr-1 font-semibold">
                                                        {formattedParts.quantity}
                                                    </span>
                                                )}
                                                {formattedParts.description}
                                            </label>
                                        </li>
                                    )
                                })}
                        </ul>
                        {groupIndex < ingredientGroups.length - 1 && <Separator className="mt-6" />}
                    </div>
                ))}
            </Card>
        </div>
    )
}
