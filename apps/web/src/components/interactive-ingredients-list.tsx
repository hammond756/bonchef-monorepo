"use client"

import { useMemo } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Separator } from "./ui/separator"
import type { Ingredient } from "@/lib/types"
import { formatIngredientLine } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"
import { useRecipeState } from "@/hooks/use-recipe-state"

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
    const {
        portions,
        setPortions,
        checkedIngredients: checkedRefs,
        toggleIngredient,
    } = useRecipeState()

    const servingsMultiplier = useMemo(() => {
        if (!initialServings || initialServings === 0) return 1 // Voorkom delen door nul
        return portions / initialServings
    }, [portions, initialServings])

    const isCheckedByRef = (groupIndex: number, ingredientIndex: number) =>
        checkedRefs.some(
            (r) => r.groupIndex === groupIndex && r.ingredientIndex === ingredientIndex
        )

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
            <Card className="bg-status-green-bg rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <span className="text-default text-sm font-medium">Aantal personen</span>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-border bg-surface hover:bg-accent h-8 w-8"
                            onClick={() => {
                                setPortions(Math.max(1, portions - 1))
                            }}
                            aria-label="Verminder aantal personen"
                        >
                            <Minus size={16} />
                        </Button>
                        <span className="text-default w-8 text-center font-semibold">
                            {portions}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-border bg-surface hover:bg-accent h-8 w-8"
                            onClick={() => {
                                setPortions(portions + 1)
                            }}
                            aria-label="Verhoog aantal personen"
                        >
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Ingredients List */}
            {ingredientGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6 last:mb-0">
                    {group.name !== "no_group" && (
                        <h3 className="text-default mb-3 text-lg font-semibold">{group.name}</h3>
                    )}
                    <ul className="space-y-2">
                        {group.ingredients &&
                            group.ingredients.map((ingredient, ingredientIndex) => {
                                const ingredientKey = getIngredientKey(groupIndex, ingredientIndex)
                                const isChecked = isCheckedByRef(groupIndex, ingredientIndex)
                                const formattedParts = formatIngredientLine(
                                    ingredient,
                                    servingsMultiplier
                                )

                                if (!formattedParts || !formattedParts.description) return null

                                return (
                                    <li
                                        key={ingredientKey}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between p-3 transition-all",
                                            isChecked && "text-foreground rounded-lg"
                                        )}
                                        onClick={() =>
                                            toggleIngredient({ groupIndex, ingredientIndex })
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "border-muted-foreground flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                                                    isChecked &&
                                                        "border-primary bg-primary text-primary-foreground"
                                                )}
                                                aria-hidden="true"
                                            >
                                                {isChecked && <CheckIcon className="h-4 w-4" />}
                                            </div>
                                            <span
                                                className={cn(
                                                    "flex-1 text-lg",
                                                    isChecked
                                                        ? "text-muted-foreground"
                                                        : "text-default"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        isChecked &&
                                                            "decoration-status-green-text line-through"
                                                    )}
                                                >
                                                    {formattedParts.quantity && (
                                                        <span className="font-semibold">
                                                            {formattedParts.quantity}
                                                        </span>
                                                    )}{" "}
                                                    {formattedParts.description}
                                                </span>
                                            </span>
                                        </div>
                                    </li>
                                )
                            })}
                    </ul>
                    {groupIndex < ingredientGroups.length - 1 && <Separator className="mt-6" />}
                </div>
            ))}
        </div>
    )
}
