import { describe, it, expect } from "vitest"
import {
    encodeRecipeState,
    decodeRecipeState,
    buildUrlWithState,
    removeStateFromUrl,
    extractStateFromUrl,
} from "./recipe-state-encoder"

describe("recipe-state-encoder", () => {
    const state = {
        version: 1 as const,
        portions: 2,
        checkedIngredients: [
            { groupIndex: 0, ingredientIndex: 1 },
            { groupIndex: 2, ingredientIndex: 0 },
        ],
        checkedSteps: [0, 3],
    }

    it("round-trips encode/decode", () => {
        const encoded = encodeRecipeState(state)
        expect(typeof encoded).toBe("string")
        const decoded = decodeRecipeState(encoded)
        expect(decoded.success).toBe(true)
        if (decoded.success) {
            expect(decoded.data).toEqual(state)
        }
    })

    it("rejects invalid portions", () => {
        const encoded = encodeRecipeState({ ...state, portions: 0 })
        const decoded = decodeRecipeState(encoded)
        expect(decoded.success).toBe(false)
    })

    it("builds and removes state from URL", () => {
        const url = "https://example.com/recipes/foo"
        const withState = buildUrlWithState(url, state)
        expect(withState).toContain("?rs=")
        const res = extractStateFromUrl(withState)
        expect(res.success).toBe(true)
        if (res.success) expect(res.data).toEqual(state)

        const cleaned = removeStateFromUrl(withState)
        expect(cleaned.includes("rs=")).toBe(false)
        const res2 = extractStateFromUrl(cleaned)
        expect(res2.success).toBe(true)
        if (res2.success) expect(res2.data).toBeNull()
    })
})
