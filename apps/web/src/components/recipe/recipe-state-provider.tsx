"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import type { IngredientIndexRef, RecipeState } from "@/hooks/use-recipe-state"

interface RecipeStateProviderProps {
    readonly children: React.ReactNode
    readonly initialPortions: number
    readonly initialCheckedIngredients?: ReadonlyArray<IngredientIndexRef>
    readonly initialCheckedSteps?: ReadonlyArray<number>
}

interface RecipeStateContextValue {
    readonly portions: number
    readonly checkedIngredients: ReadonlyArray<IngredientIndexRef>
    readonly checkedSteps: ReadonlyArray<number>
    setPortions: (portions: number) => void
    setIngredientChecked: (ref: IngredientIndexRef, isChecked: boolean) => void
    setStepChecked: (stepIndex: number, isChecked: boolean) => void
    resetToInitialState: () => void
    isDirty: () => boolean
    snapshot: () => RecipeState
}

const RecipeStateContext = createContext<RecipeStateContextValue | null>(null)

function areSameIngredient(a: IngredientIndexRef, b: IngredientIndexRef): boolean {
    return a.groupIndex === b.groupIndex && a.ingredientIndex === b.ingredientIndex
}

/**
 * Provides in-memory state for portions, checked ingredients and steps on a recipe page.
 *
 * This provider is intentionally UI-only. Persistence (URL/localStorage) is layered
 * on top via a dedicated hook so the provider remains reusable and predictable.
 */
export function RecipeStateProvider({
    children,
    initialPortions,
    initialCheckedIngredients = [],
    initialCheckedSteps = [],
}: Readonly<RecipeStateProviderProps>) {
    const [portions, setPortions] = useState<number>(initialPortions)
    const [checkedIngredients, setCheckedIngredients] = useState<IngredientIndexRef[]>(() => [
        ...initialCheckedIngredients,
    ])
    const [checkedSteps, setCheckedSteps] = useState<number[]>(() => [...initialCheckedSteps])

    // Freeze initial snapshot for dirty comparisons
    const initialSnapshotRef = useRef<RecipeState>({
        version: 1,
        portions: initialPortions,
        checkedIngredients: [...initialCheckedIngredients],
        checkedSteps: [...initialCheckedSteps],
    })

    const setIngredientChecked = useCallback((ref: IngredientIndexRef, isChecked: boolean) => {
        setCheckedIngredients((prev) => {
            const exists = prev.some((r) => areSameIngredient(r, ref))
            if (isChecked && !exists) return [...prev, ref]
            if (!isChecked && exists) return prev.filter((r) => !areSameIngredient(r, ref))
            return prev
        })
    }, [])

    const setStepChecked = useCallback((stepIndex: number, isChecked: boolean) => {
        setCheckedSteps((prev) => {
            const has = prev.includes(stepIndex)
            if (isChecked && !has) return [...prev, stepIndex]
            if (!isChecked && has) return prev.filter((i) => i !== stepIndex)
            return prev
        })
    }, [])

    const resetToInitialState = useCallback(() => {
        const snap = initialSnapshotRef.current
        setPortions(snap.portions)
        setCheckedIngredients(snap.checkedIngredients)
        setCheckedSteps(snap.checkedSteps)
    }, [])

    const snapshot = useCallback<() => RecipeState>(() => {
        return {
            version: 1,
            portions,
            checkedIngredients,
            checkedSteps,
        }
    }, [portions, checkedIngredients, checkedSteps])

    const isDirty = useCallback(() => {
        const snap = initialSnapshotRef.current
        if (snap.portions !== portions) return true
        if (snap.checkedSteps.length !== checkedSteps.length) return true
        if (snap.checkedIngredients.length !== checkedIngredients.length) return true

        const stepSet = new Set(checkedSteps)
        for (const s of snap.checkedSteps) if (!stepSet.has(s)) return true

        const toKey = (r: IngredientIndexRef) => `${r.groupIndex}:${r.ingredientIndex}`
        const ingSet = new Set(checkedIngredients.map(toKey))
        for (const r of snap.checkedIngredients) if (!ingSet.has(toKey(r))) return true

        return false
    }, [portions, checkedIngredients, checkedSteps])

    const value = useMemo<RecipeStateContextValue>(
        () => ({
            portions,
            checkedIngredients,
            checkedSteps,
            setPortions,
            setIngredientChecked,
            setStepChecked,
            resetToInitialState,
            isDirty,
            snapshot,
        }),
        [
            portions,
            checkedIngredients,
            checkedSteps,
            setIngredientChecked,
            setStepChecked,
            resetToInitialState,
            isDirty,
            snapshot,
        ]
    )

    return <RecipeStateContext.Provider value={value}>{children}</RecipeStateContext.Provider>
}

/**
 * Access the current recipe state context from within a descendant component.
 * Throws when used outside of the provider to catch integration mistakes early.
 */
export function useRecipeStateContext(): RecipeStateContextValue {
    const ctx = useContext(RecipeStateContext)
    if (!ctx) throw new Error("useRecipeStateContext must be used within RecipeStateProvider")
    return ctx
}

/**
 * Optional variant that returns null when no provider is present.
 * Useful for components that can operate with or without recipe state.
 */
export function useOptionalRecipeStateContext(): RecipeStateContextValue | null {
    return useContext(RecipeStateContext)
}
