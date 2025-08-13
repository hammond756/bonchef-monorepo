import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { RecipeStateProvider, useRecipeStateContext } from "./recipe-state-provider"

function wrapper({ children }: { children: React.ReactNode }) {
    return <RecipeStateProvider initialPortions={2}>{children}</RecipeStateProvider>
}

describe("RecipeStateProvider", () => {
    it("exposes initial values and updates portions", () => {
        const { result } = renderHook(() => useRecipeStateContext(), { wrapper })
        expect(result.current.portions).toBe(2)
        act(() => result.current.setPortions(3))
        expect(result.current.portions).toBe(3)
    })

    it("toggles ingredient checked state", () => {
        const { result } = renderHook(() => useRecipeStateContext(), { wrapper })
        const ref = { groupIndex: 0, ingredientIndex: 1 }
        act(() => result.current.setIngredientChecked(ref, true))
        expect(result.current.checkedIngredients).toEqual([ref])
        act(() => result.current.setIngredientChecked(ref, false))
        expect(result.current.checkedIngredients).toEqual([])
    })

    it("toggles step checked state", () => {
        const { result } = renderHook(() => useRecipeStateContext(), { wrapper })
        act(() => result.current.setStepChecked(2, true))
        expect(result.current.checkedSteps).toEqual([2])
        act(() => result.current.setStepChecked(2, false))
        expect(result.current.checkedSteps).toEqual([])
    })

    it("reports dirty state and snapshot correctly", () => {
        const { result } = renderHook(() => useRecipeStateContext(), { wrapper })
        expect(result.current.isDirty()).toBe(false)
        act(() => result.current.setPortions(4))
        expect(result.current.isDirty()).toBe(true)
        const snap = result.current.snapshot()
        expect(snap.portions).toBe(4)
        expect(snap.checkedSteps).toEqual([])
        expect(snap.checkedIngredients).toEqual([])
    })
})
