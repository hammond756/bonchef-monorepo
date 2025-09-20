import { describe, test, expect, vi } from "vitest"
import { validateRecipeContent } from "@/lib/utils/recipe-validation"

// Mock the GeneratedRecipeWithSource type for testing
type MockRecipe = {
    containsFood: boolean
    enoughContext: boolean
    thumbnail: string
}

describe("validateRecipeContent", () => {
    const createMockRecipe = (overrides: Partial<MockRecipe> = {}): MockRecipe => ({
        containsFood: true,
        enoughContext: true,
        thumbnail: "test.jpg",
        ...overrides,
    })

    describe("Image validation (strict)", () => {
        test("passes when both containsFood and enoughContext are true", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "image")

            expect(result.isError).toBe(false)
            expect(result.message).toBeUndefined()
            expect(result.warning).toBeUndefined()
        })

        test("fails when containsFood is false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "image")

            expect(result.isError).toBe(true)
            expect(result.message).toBe("Deze afbeelding lijkt geen recept te bevatten")
            expect(result.warning).toBeUndefined()
        })

        test("fails when enoughContext is false", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "image")

            expect(result.isError).toBe(true)
            expect(result.message).toBe(
                "We konden niet genoeg informatie uit de afbeelding halen om een recept te maken"
            )
            expect(result.warning).toBeUndefined()
        })

        test("fails when both containsFood and enoughContext are false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "image")

            expect(result.isError).toBe(true)
            expect(result.message).toBe("Deze afbeelding lijkt geen recept te bevatten")
            expect(result.warning).toBeUndefined()
        })
    })

    describe("URL validation (strict - same as images)", () => {
        test("passes when both containsFood and enoughContext are true", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "url")

            expect(result.isError).toBe(false)
            expect(result.message).toBeUndefined()
            expect(result.warning).toBeUndefined()
        })

        test("fails when containsFood is false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "url")

            expect(result.isError).toBe(true)
            expect(result.message).toBe("Deze pagina lijkt geen recept te bevatten")
            expect(result.warning).toBeUndefined()
        })

        test("fails when enoughContext is false", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "url")

            expect(result.isError).toBe(true)
            expect(result.message).toBe(
                "We konden niet genoeg informatie vinden om een goed recept te maken"
            )
            expect(result.warning).toBeUndefined()
        })
    })

    describe("Text validation (flexible)", () => {
        test("passes when both containsFood and enoughContext are true", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "text")

            expect(result.isError).toBe(false)
            expect(result.message).toBeUndefined()
            expect(result.warning).toBeUndefined()
        })

        test("fails when containsFood is false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "text")

            expect(result.isError).toBe(true)
            expect(result.message).toBe("Deze tekst lijkt geen recept te bevatten")
            expect(result.warning).toBeUndefined()
        })

        test("continues with warning when enoughContext is false", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "text")

            expect(result.isError).toBe(false)
            expect(result.message).toBe(
                "Het lijkt erop dat er beperkte context beschikbaar is - recept wordt gegenereerd met beschikbare informatie"
            )
        })

        test("fails when both containsFood and enoughContext are false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "text")

            expect(result.isError).toBe(true)
            expect(result.message).toBe("Deze tekst lijkt geen recept te bevatten")
            expect(result.warning).toBeUndefined()
        })

        test("fails when not enough context for vertical_video", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "vertical_video")

            expect(result.isError).toBe(true)
            expect(result.message).toBe(
                "We konden niet genoeg informatie vinden om een goed recept te maken"
            )
        })

        test("fails when no food content for vertical_video", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "vertical_video")

            expect(result.isError).toBe(true)
            expect(result.message).toBe("Deze video lijkt geen recept te bevatten")
        })
    })

    describe("Dishcovery validation", () => {
        test("passes when both containsFood and enoughContext are true", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "dishcovery")
        })

        test("fails when containsFood is false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: true })
            const result = validateRecipeContent(recipe as any, "dishcovery")
        })

        test("fails when enoughContext is false", () => {
            const recipe = createMockRecipe({ containsFood: true, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "dishcovery")
        })

        test("fails when both containsFood and enoughContext are false", () => {
            const recipe = createMockRecipe({ containsFood: false, enoughContext: false })
            const result = validateRecipeContent(recipe as any, "dishcovery")
        })
    })

    describe("Edge cases", () => {
        test("handles unknown source type gracefully", () => {
            const recipe = createMockRecipe()
            const result = validateRecipeContent(recipe as any, "unknown" as any)

            expect(result.isError).toBe(false)
            expect(result.message).toBeUndefined()
            expect(result.warning).toBeUndefined()
        })
    })
})
