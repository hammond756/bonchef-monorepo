import { useState, useCallback, useMemo } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { v4 as uuidv4 } from "uuid"
import type { Ingredient } from "@/lib/types"

interface RecipeIngredientGroup {
    name: string
    ingredients: Ingredient[]
}

// Internal state representation with stable IDs for UI
export interface UIIngredient {
    id: string
    quantity: number
    unit: string
    name: string
}

export interface UIIngredientGroup {
    id: string
    title: string
    ingredients: UIIngredient[]
}

// The API of commands the hook exposes
export interface IngredientGroupsAPI {
    addGroup: () => void
    deleteGroup: (groupId: string) => void
    updateGroupTitle: (groupId: string, title: string) => void
    reorderGroup: (oldIndex: number, newIndex: number) => void
    toggleGroup: (groupId: string) => void
    addIngredient: (groupId: string) => void
    deleteIngredient: (groupId: string, ingredientId: string) => void
    updateIngredient: (
        groupId: string,
        ingredientId: string,
        updates: Partial<UIIngredient>
    ) => void
    reorderIngredient: (groupId: string, oldIndex: number, newIndex: number) => void
}

const normalizeToRecipeFormat = (groups: UIIngredientGroup[]): RecipeIngredientGroup[] => {
    return groups.map((group) => ({
        name: group.title,
        ingredients: group.ingredients.map((ingredient) => ({
            quantity: {
                type: "range" as const,
                low: ingredient.quantity || 0,
                high: ingredient.quantity || 0,
            },
            unit: ingredient.unit.trim() || "none",
            description: ingredient.name,
        })),
    }))
}

export const useIngredientGroups = (
    initialGroups: RecipeIngredientGroup[],
    onChange?: (groups: RecipeIngredientGroup[]) => void
): [UIIngredientGroup[], boolean[], IngredientGroupsAPI] => {
    const [groups, setGroups] = useState<UIIngredientGroup[]>(() =>
        initialGroups.map((g) => ({
            id: uuidv4(),
            title: g.name,
            ingredients: g.ingredients.map((i) => ({
                id: uuidv4(),
                quantity: i.quantity.low ?? 0,
                unit: i.unit,
                name: i.description,
            })),
        }))
    )

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
        groups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
    )

    const isExpanded = useMemo(() => {
        return groups.map((g) => expandedGroups[g.id] ?? false)
    }, [groups, expandedGroups])

    const handleStateChange = (newGroups: UIIngredientGroup[]) => {
        setGroups(newGroups)
        if (onChange) {
            onChange(normalizeToRecipeFormat(newGroups))
        }
    }

    const addGroup = useCallback(() => {
        const newGroup: UIIngredientGroup = {
            id: uuidv4(),
            title: "Nieuwe groep",
            ingredients: [],
        }
        setExpandedGroups((prev) => ({ ...prev, [newGroup.id]: true }))
        handleStateChange([...groups, newGroup])
    }, [groups, handleStateChange])

    const deleteGroup = useCallback(
        (groupId: string) => {
            handleStateChange(groups.filter((g) => g.id !== groupId))
        },
        [groups, handleStateChange]
    )

    const updateGroupTitle = useCallback(
        (groupId: string, title: string) => {
            const newGroups = groups.map((g) => (g.id === groupId ? { ...g, title } : g))
            handleStateChange(newGroups)
        },
        [groups, handleStateChange]
    )

    const reorderGroup = useCallback(
        (oldIndex: number, newIndex: number) => {
            handleStateChange(arrayMove(groups, oldIndex, newIndex))
        },
        [groups, handleStateChange]
    )

    const toggleGroup = useCallback((groupId: string) => {
        setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
    }, [])

    const addIngredient = useCallback(
        (groupId: string) => {
            const newIngredient: UIIngredient = {
                id: uuidv4(),
                quantity: 0,
                unit: "",
                name: "",
            }
            const newGroups = groups.map((g) =>
                g.id === groupId ? { ...g, ingredients: [...g.ingredients, newIngredient] } : g
            )
            setExpandedGroups((prev) => ({ ...prev, [groupId]: true }))
            handleStateChange(newGroups)
        },
        [groups, handleStateChange]
    )

    const deleteIngredient = useCallback(
        (groupId: string, ingredientId: string) => {
            const newGroups = groups.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          ingredients: g.ingredients.filter((i) => i.id !== ingredientId),
                      }
                    : g
            )
            handleStateChange(newGroups)
        },
        [groups, handleStateChange]
    )

    const updateIngredient = useCallback(
        (groupId: string, ingredientId: string, updates: Partial<UIIngredient>) => {
            // Normalize empty values
            const normalizedUpdates = { ...updates }
            if (updates.quantity !== undefined) {
                normalizedUpdates.quantity = updates.quantity || 0
            }
            if (updates.unit !== undefined) {
                normalizedUpdates.unit = updates.unit.trim() || ""
            }

            const newGroups = groups.map((g) =>
                g.id === groupId
                    ? {
                          ...g,
                          ingredients: g.ingredients.map((i) =>
                              i.id === ingredientId ? { ...i, ...normalizedUpdates } : i
                          ),
                      }
                    : g
            )
            handleStateChange(newGroups)
        },
        [groups, handleStateChange]
    )

    const reorderIngredient = useCallback(
        (groupId: string, oldIndex: number, newIndex: number) => {
            const newGroups = groups.map((g) => {
                if (g.id === groupId) {
                    return {
                        ...g,
                        ingredients: arrayMove(g.ingredients, oldIndex, newIndex),
                    }
                }
                return g
            })
            handleStateChange(newGroups)
        },
        [groups, handleStateChange]
    )

    const api = useMemo(
        () => ({
            addGroup,
            deleteGroup,
            updateGroupTitle,
            reorderGroup,
            toggleGroup,
            addIngredient,
            deleteIngredient,
            updateIngredient,
            reorderIngredient,
        }),
        [
            addGroup,
            deleteGroup,
            updateGroupTitle,
            reorderGroup,
            toggleGroup,
            addIngredient,
            deleteIngredient,
            updateIngredient,
            reorderIngredient,
        ]
    )

    return [groups, isExpanded, api]
}
