/**
 * Recipe state persistence: core types and interfaces
 *
 * Why index-based references?
 * Public recipe views do not guarantee stable IDs per ingredient/step.
 * Using array indices keeps the encoding compact and URL-friendly while
 * avoiding coupling to internal editor-only IDs.
 */

/**
 * Identifies a specific ingredient by its group index and ingredient index
 * within that group.
 */
export interface IngredientIndexRef {
    groupIndex: number
    ingredientIndex: number
}

/**
 * Versioned schema for persisted recipe state.
 *
 * - portions: integer count selected by the user. Scaling in UI derives from this
 * - checkedIngredients: list of ingredient positions that are marked as done
 * - checkedSteps: list of step indices that are marked as done
 */
export interface RecipeStateV1 {
    version: 1
    portions: number
    checkedIngredients: IngredientIndexRef[]
    checkedSteps: number[]
}

/**
 * The latest recipe state schema version constant.
 */
export const RECIPE_STATE_SCHEMA_VERSION = 1 as const

/**
 * Union for forward compatibility when newer versions are introduced.
 */
export type RecipeState = RecipeStateV1

import { useCallback } from "react"
import {
    useRecipeStateContext,
    useOptionalRecipeStateContext,
} from "@/components/recipe/recipe-state-provider"
import { extractStateFromUrl } from "@/lib/utils/recipe-state-encoder"
import { toast } from "@/hooks/use-toast"

/**
 * Hook that exposes the recipe state and convenience helpers.
 */
export function useRecipeState() {
    const ctx = useRecipeStateContext()

    const toggleIngredient = useCallback(
        (ref: IngredientIndexRef) => {
            const isChecked = ctx.checkedIngredients.some(
                (r) => r.groupIndex === ref.groupIndex && r.ingredientIndex === ref.ingredientIndex
            )
            ctx.setIngredientChecked(ref, !isChecked)
        },
        [ctx]
    )

    const toggleStep = useCallback(
        (stepIndex: number) => {
            const isChecked = ctx.checkedSteps.includes(stepIndex)
            ctx.setStepChecked(stepIndex, !isChecked)
            console.log(ctx.snapshot())
        },
        [ctx]
    )

    const clearAll = useCallback(() => {
        ctx.resetToInitialState()
    }, [ctx])

    return {
        portions: ctx.portions,
        checkedIngredients: ctx.checkedIngredients,
        checkedSteps: ctx.checkedSteps,
        setPortions: ctx.setPortions,
        setIngredientChecked: ctx.setIngredientChecked,
        setStepChecked: ctx.setStepChecked,
        toggleIngredient,
        toggleStep,
        clearAll,
        isDirty: ctx.isDirty,
        snapshot: ctx.snapshot,
    }
}

/**
 * Optional variant that returns null when used outside of a provider.
 */
export function useOptionalRecipeState() {
    return useOptionalRecipeStateContext()
}

/**
 * Attempts to restore state from the current window.location URL.
 * On invalid or missing state, returns false and optionally shows an info toast.
 */
export function useRestoreRecipeStateFromUrl(options?: { showToastOnFailure?: boolean }) {
    const ctx = useRecipeStateContext()
    return useCallback(() => {
        if (typeof window === "undefined") return false
        const res = extractStateFromUrl(window.location.href)
        if (!res.success) {
            if (options?.showToastOnFailure ?? true) {
                toast({
                    title: "Kon receptstatus niet herstellen",
                    description:
                        "De link bevatte geen geldige voortgang. We hebben een schone versie geladen.",
                })
            }
            return false
        }
        if (res.data == null) return false

        // Apply snapshot
        ctx.setPortions(res.data.portions)
        // Reset all first then add
        ctx.resetToInitialState()
        ctx.setPortions(res.data.portions)
        for (const ref of res.data.checkedIngredients) ctx.setIngredientChecked(ref, true)
        for (const s of res.data.checkedSteps) ctx.setStepChecked(s, true)
        return true
    }, [ctx, options?.showToastOnFailure])
}
