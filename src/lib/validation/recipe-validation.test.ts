import { describe, it, expect } from "vitest"
import {
    validateSourceUrl,
    validateSourceName,
    validateRecipe,
    isRecipeValid,
} from "./recipe-validation"
import { Recipe } from "../types"

describe("Recipe Validation", () => {
    describe("validateSourceUrl", () => {
        it("should return undefined for empty or null source URL", () => {
            expect(validateSourceUrl("")).toBeUndefined()
            expect(validateSourceUrl(null)).toBeUndefined()
            expect(validateSourceUrl(undefined)).toBeUndefined()
        })

        it("should accept valid URLs", () => {
            const validUrls = [
                "https://www.example.com/recipe",
                "http://example.com/recipe",
                "https://cooking.nytimes.com/recipes/12345",
                "https://www.allrecipes.com/recipe/12345",
            ]

            validUrls.forEach((url) => {
                expect(validateSourceUrl(url)).toBeUndefined()
            })
        })

        it("should reject invalid URLs", () => {
            const invalidUrls = ["not-a-url", "just-text", "https://", "http://"]

            invalidUrls.forEach((url) => {
                expect(validateSourceUrl(url)).toBe("Ongeldige URL")
            })
        })

        it("should reject URLs longer than 2047 characters", () => {
            const longUrl = "https://example.com/" + "a".repeat(2047)
            expect(validateSourceUrl(longUrl)).toBe("URL mag maximaal 2047 karakters bevatten")
        })
    })

    describe("validateSourceName", () => {
        it("should return undefined when no source URL is provided", () => {
            expect(validateSourceName("", "")).toBeUndefined()
            expect(validateSourceName("", null)).toBeUndefined()
            expect(validateSourceName("", undefined)).toBeUndefined()
            expect(validateSourceName(null, "")).toBeUndefined()
            expect(validateSourceName(undefined, "")).toBeUndefined()
        })

        it("should return undefined when source URL is empty or whitespace", () => {
            expect(validateSourceName("", "   ")).toBeUndefined()
            expect(validateSourceName("", "\t\n")).toBeUndefined()
        })

        it("should return undefined when both source name and URL are provided", () => {
            expect(validateSourceName("AllRecipes", "https://example.com")).toBeUndefined()
            expect(validateSourceName("Oma's kookboek", "https://example.com")).toBeUndefined()
        })

        it("should require source name when source URL is provided", () => {
            expect(validateSourceName("", "https://example.com")).toBe(
                "Voer de bron naam van je link in voordat je verder gaat"
            )
            expect(validateSourceName("   ", "https://example.com")).toBe(
                "Voer de bron naam van je link in voordat je verder gaat"
            )
            expect(validateSourceName(null, "https://example.com")).toBe(
                "Voer de bron naam van je link in voordat je verder gaat"
            )
            expect(validateSourceName(undefined, "https://example.com")).toBe(
                "Voer de bron naam van je link in voordat je verder gaat"
            )
        })
    })

    describe("validateRecipe with source fields", () => {
        const createBaseRecipe = (): Recipe => ({
            id: "test-id",
            title: "Test Recipe",
            description: "Test description",
            thumbnail: "https://example.com/image.jpg",
            source_url: "",
            source_name: "",
            is_public: false,
            user_id: "test-user-id",
            total_cook_time_minutes: 30,
            n_portions: 4,
            ingredients: [
                {
                    name: "Main ingredients",
                    ingredients: [
                        {
                            description: "Test ingredient",
                            quantity: { type: "range" as const, low: 1, high: 1 },
                            unit: "stuks",
                        },
                    ],
                },
            ],
            instructions: ["Test instruction step 1", "Test instruction step 2"],
            profiles: {
                display_name: "Test User",
                id: "test-user-id",
            },
        })

        it("should pass validation when no source URL is provided", () => {
            const recipe = createBaseRecipe()
            const errors = validateRecipe(recipe)

            expect(errors.sourceUrl).toBeUndefined()
            expect(errors.sourceName).toBeUndefined()
            expect(isRecipeValid(recipe)).toBe(true)
        })

        it("should pass validation when both source name and URL are provided", () => {
            const recipe = createBaseRecipe()
            recipe.source_name = "AllRecipes"
            recipe.source_url = "https://www.allrecipes.com/recipe/12345"

            const errors = validateRecipe(recipe)

            expect(errors.sourceUrl).toBeUndefined()
            expect(errors.sourceName).toBeUndefined()
            expect(isRecipeValid(recipe)).toBe(true)
        })

        it("should fail validation when source URL is provided but source name is missing", () => {
            const recipe = createBaseRecipe()
            recipe.source_url = "https://www.allrecipes.com/recipe/12345"
            recipe.source_name = ""

            const errors = validateRecipe(recipe)

            expect(errors.sourceUrl).toBeUndefined()
            expect(errors.sourceName).toBe(
                "Voer de bron naam van je link in voordat je verder gaat"
            )
            expect(isRecipeValid(recipe)).toBe(false)
        })

        it("should fail validation when source URL is invalid", () => {
            const recipe = createBaseRecipe()
            recipe.source_name = "AllRecipes"
            recipe.source_url = "not-a-valid-url"

            const errors = validateRecipe(recipe)

            expect(errors.sourceUrl).toBe("Ongeldige URL")
            expect(errors.sourceName).toBeUndefined()
            expect(isRecipeValid(recipe)).toBe(false)
        })

        it("should fail validation when source URL is too long", () => {
            const recipe = createBaseRecipe()
            recipe.source_name = "AllRecipes"
            recipe.source_url = "https://example.com/" + "a".repeat(2047)

            const errors = validateRecipe(recipe)

            expect(errors.sourceUrl).toBe("URL mag maximaal 2047 karakters bevatten")
            expect(errors.sourceName).toBeUndefined()
            expect(isRecipeValid(recipe)).toBe(false)
        })
    })
})
