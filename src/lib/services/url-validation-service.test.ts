import { describe, it, expect } from "vitest"
import { validateUrlForImport } from "./url-validation-service"

describe("URL Validation Service", () => {
    describe("validateUrlForImport", () => {
        it("should accept valid URLs", () => {
            const validUrls = [
                "https://www.recipetineats.com/parmesan-roasted-green-beans/",
                "https://www.hellofresh.nl/recipes/kleine-half-om-half-hamburgers",
                "https://www.allrecipes.com/recipe/12345",
                "https://cooking.nytimes.com/recipes/12345",
            ]

            validUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(true)
                expect(result.errorMessage).toBeUndefined()
            })
        })

        it("should reject Facebook URLs", () => {
            const facebookUrls = [
                "https://www.facebook.com/recipe/12345",
                "https://facebook.com/recipe/12345",
                "https://m.facebook.com/recipe/12345",
                "https://www.facebook.nl/recipe/12345",
                "https://facebook.nl/recipe/12345",
                "https://www.facebook.be/recipe/12345",
                "https://facebook.be/recipe/12345",
            ]

            facebookUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(false)
                expect(result.errorMessage).toBe(
                    "Deze bron ondersteunen we via URL nog niet (maar dat komt eraan!). Probeer het intussen met een foto of screenshot 😉"
                )
            })
        })

        it("should reject Instagram URLs", () => {
            const instagramUrls = [
                "https://www.instagram.com/p/ABC123/",
                "https://instagram.com/p/ABC123/",
                "https://www.instagram.com/reel/ABC123/",
                "https://www.instagram.nl/p/ABC123/",
                "https://instagram.nl/p/ABC123/",
                "https://www.instagram.be/p/ABC123/",
                "https://instagram.be/p/ABC123/",
            ]

            instagramUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(false)
                expect(result.errorMessage).toBe(
                    "Deze bron ondersteunen we via URL nog niet (maar dat komt eraan!). Probeer het intussen met een foto of screenshot 😉"
                )
            })
        })

        it("should reject TikTok URLs", () => {
            const tiktokUrls = [
                "https://www.tiktok.com/@user/video/12345",
                "https://tiktok.com/@user/video/12345",
                "https://vm.tiktok.com/ABC123/",
                "https://www.tiktok.nl/@user/video/12345",
                "https://tiktok.nl/@user/video/12345",
                "https://www.tiktok.be/@user/video/12345",
                "https://tiktok.be/@user/video/12345",
            ]

            tiktokUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(false)
                expect(result.errorMessage).toBe(
                    "Deze bron ondersteunen we via URL nog niet (maar dat komt eraan!). Probeer het intussen met een foto of screenshot 😉"
                )
            })
        })

        it("should reject Albert Heijn URLs", () => {
            const ahUrls = [
                "https://www.ah.nl/allerhande/recepten/recipe/12345",
                "https://ah.nl/allerhande/recepten/recipe/12345",
                "https://www.albert-heijn.nl/allerhande/recepten/recipe/12345",
                "https://albertheijn.nl/allerhande/recepten/recipe/12345",
            ]

            ahUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(false)
                expect(result.errorMessage).toBe(
                    "Deze bron ondersteunen we via URL nog niet (maar dat komt eraan!). Probeer het intussen met een foto of screenshot 😉"
                )
            })
        })

        it("should handle URLs without protocol", () => {
            const urlsWithoutProtocol = [
                "www.recipetineats.com/parmesan-roasted-green-beans/",
                "recipetineats.com/parmesan-roasted-green-beans/",
            ]

            urlsWithoutProtocol.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(true)
                expect(result.errorMessage).toBeUndefined()
            })
        })

        it("should reject invalid URLs", () => {
            const invalidUrls = ["javascript:alert('test')"]

            invalidUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(false)
                expect(result.errorMessage).toBe("De ingevoerde URL is ongeldig.")
            })
        })

        it("should handle case insensitive matching", () => {
            const mixedCaseUrls = [
                "https://www.FACEBOOK.com/recipe/12345",
                "https://www.Instagram.com/p/ABC123/",
                "https://www.TIKTOK.com/@user/video/12345",
                "https://www.AH.nl/allerhande/recepten/recipe/12345",
            ]

            mixedCaseUrls.forEach((url) => {
                const result = validateUrlForImport(url)
                expect(result.isValid).toBe(false)
                expect(result.errorMessage).toBe(
                    "Deze bron ondersteunen we via URL nog niet (maar dat komt eraan!). Probeer het intussen met een foto of screenshot 😉"
                )
            })
        })
    })
})
