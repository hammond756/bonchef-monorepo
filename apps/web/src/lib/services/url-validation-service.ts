/**
 * Service for validating URLs before import
 */

interface UrlValidationResult {
    isValid: boolean
    errorMessage?: string
}

/**
 * List of unsupported URL patterns that should be blocked
 * This can be easily extended by adding new patterns
 */
const PATTERNS_TO_CHECK = [
    // Social media platforms
    { pattern: /facebook\.(com|nl|be|de|fr|co\.uk)/i, name: "Facebook" },
    { pattern: /instagram\.(com|nl|be|de|fr|co\.uk)/i, name: "Instagram" },

    // Dutch supermarkets
    { pattern: /ah\.nl/i, name: "Albert Heijn" },
    { pattern: /albert-heijn\.nl/i, name: "Albert Heijn" },
    { pattern: /albertheijn\.nl/i, name: "Albert Heijn" },
]

/**
 * Validates if a URL is supported by Bonchef
 * @param url The URL to validate
 * @returns UrlValidationResult with validation status and optional error message
 */
export function validateUrlForImport(url: string): UrlValidationResult {
    try {
        // Normalize the URL first (this handles URLs without protocol)
        const normalizedUrl = normalizeUrl(url)
        const urlObj = new URL(normalizedUrl)

        // Check against unsupported patterns (social media, Albert Heijn, etc.)
        for (const { pattern, name } of PATTERNS_TO_CHECK) {
            if (pattern.test(urlObj.href)) {
                if (name === "Instagram") {
                    return validateInstagramUrl(url)
                }

                return {
                    isValid: false,
                    errorMessage: `Deze bron ondersteunen we via URL nog niet (maar dat komt eraan!). Probeer het intussen met een foto of screenshot 😉`,
                }
            }
        }

        return { isValid: true }
    } catch (_error) {
        return {
            isValid: false,
            errorMessage: "De ingevoerde URL is ongeldig.",
        }
    }
}

/**
 * Normalizes a URL by ensuring it has a scheme.
 * @param url The URL to normalize.
 * @returns The normalized URL.
 */
function normalizeUrl(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`
    }
    return url
}

function validateInstagramUrl(url: string): UrlValidationResult {
    const urlObj = new URL(url)

    if (urlObj.pathname.includes("/reel/")) {
        return { isValid: true }
    }

    return {
        isValid: false,
        errorMessage:
            "Sorry! Op dit moment ondersteunen we voor Instagram alleen het importeren van reels.",
    }
}
