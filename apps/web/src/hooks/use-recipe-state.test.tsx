import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { RecipeStateProvider } from "@/components/recipe/recipe-state-provider"
import { useRecipeState, useRestoreRecipeStateFromUrl } from "./use-recipe-state"

function Wrapper({ children }: { children: React.ReactNode }) {
    return <RecipeStateProvider initialPortions={1}>{children}</RecipeStateProvider>
}

describe("useRestoreRecipeStateFromUrl", () => {
    it("exposes a callable restorer and base state stays functional", () => {
        const { result: base } = renderHook(() => useRecipeState(), { wrapper: Wrapper })
        const { result } = renderHook(
            () => useRestoreRecipeStateFromUrl({ showToastOnFailure: false }),
            { wrapper: Wrapper }
        )

        act(() => {
            base.current.setPortions(3)
            base.current.setStepChecked(2, true)
        })
        expect(base.current.portions).toBe(3)
        expect(base.current.checkedSteps).toEqual([2])
        expect(typeof result.current).toBe("function")
    })
})

describe("useRecipeState", () => {
    it("provides state and toggle helpers", () => {
        const { result } = renderHook(() => useRecipeState(), { wrapper: Wrapper })
        expect(result.current.portions).toBe(1)
        act(() => result.current.setPortions(2))
        expect(result.current.portions).toBe(2)

        const ref = { groupIndex: 0, ingredientIndex: 0 }
        act(() => result.current.toggleIngredient(ref))
        expect(result.current.checkedIngredients).toEqual([ref])
        act(() => result.current.toggleIngredient(ref))
        expect(result.current.checkedIngredients).toEqual([])

        act(() => result.current.toggleStep(3))
        expect(result.current.checkedSteps).toEqual([3])
        act(() => result.current.toggleStep(3))
        expect(result.current.checkedSteps).toEqual([])
    })

    it("clearAll resets to initial snapshot", () => {
        const { result } = renderHook(() => useRecipeState(), { wrapper: Wrapper })
        act(() => result.current.setPortions(5))
        act(() => result.current.toggleStep(1))
        act(() => result.current.clearAll())
        expect(result.current.portions).toBe(1)
        expect(result.current.checkedSteps).toEqual([])
        expect(result.current.checkedIngredients).toEqual([])
    })
})
