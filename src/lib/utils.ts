import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Ingredient, RecipeWrite } from "./types"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"
import { GeneratedRecipe } from "./types"
import { SupabaseClient } from "@supabase/supabase-js"
import TimeAgo from "javascript-time-ago"
import nl from "javascript-time-ago/locale/nl"

// Configure TimeAgo with Dutch locale
TimeAgo.addLocale(nl)
const timeAgo = new TimeAgo("nl-NL")

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generatedRecipeToRecipe(generatedRecipe: GeneratedRecipe): RecipeWrite {
    return {
        ...generatedRecipe,
        description: "",
        thumbnail: TINY_PLACEHOLDER_IMAGE,
        source_url: "https://app.bonchef.io",
        source_name: "BonChef",
        // TODO: figure out how to make it optional through the zod schema
        is_public: false,
    }
}

// Helper to find the greatest common divisor
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b)
}

// Converts a decimal number to a fraction string, e.g., 1.5 -> "1 1/2"
function numberToFraction(num: number): string {
    if (num === 0) return "0"
    // Handle whole numbers directly
    if (num % 1 === 0) {
        return num.toString()
    }

    const tolerance = 1.0e-6
    const wholePart = Math.floor(num)
    const decimalPart = num - wholePart

    if (decimalPart < tolerance) {
        return wholePart.toString()
    }

    let h1 = 1,
        h2 = 0,
        k1 = 0,
        k2 = 1
    let b = decimalPart
    do {
        const a = Math.floor(b)
        let aux = h1
        h1 = a * h1 + h2
        h2 = aux
        aux = k1
        k1 = a * k1 + k2
        k2 = aux
        b = 1 / (b - a)
    } while (Math.abs(decimalPart - h1 / k1) > decimalPart * tolerance)

    const numerator = h1
    const denominator = k1

    // Simplify the fraction
    const commonDivisor = gcd(numerator, denominator)
    const simplifiedNumerator = numerator / commonDivisor
    const simplifiedDenominator = denominator / commonDivisor

    let result = ""
    if (wholePart > 0) {
        result += wholePart + " "
    }

    result += `${simplifiedNumerator}/${simplifiedDenominator}`

    return result
}

export function formatIngredientLine(
    ingredient: Ingredient,
    multiplier: number
): { quantity: string; description: string } | null {
    if (!ingredient || typeof ingredient.description !== "string") {
        return null
    }

    // Check if ingredient has quantity data
    if (!ingredient.quantity || !ingredient.quantity.low) {
        // No quantity - just return the description
        return {
            quantity: "",
            description: ingredient.description,
        }
    }

    // Per user request, always display the lowest number of the range.
    // The long-term fix is to adjust the LLM prompt to only generate ranges for specific terms.
    const low = ingredient.quantity.low * multiplier
    const unit = ingredient.unit

    // Define which units should always be displayed as decimals instead of fractions.
    const decimalUnits = ["kg", "l"]
    const shouldUseDecimal = decimalUnits.includes(unit)

    let quantityStr = ""

    if (low > 0) {
        if (shouldUseDecimal) {
            // For specified units, use decimals (e.g., 1.5 kg)
            const formatDecimal = (num: number) => {
                const rounded = parseFloat(num.toFixed(2))
                return rounded.toString()
            }
            quantityStr = formatDecimal(low)
        } else {
            // For all other units, use fractions (e.g., 1 1/2 tl)
            quantityStr = numberToFraction(low)
        }
    }

    // Don't display the unit if it is 'none' or empty
    const unitStr = unit && unit.trim() && unit.toLowerCase() !== "none" ? unit : ""

    return {
        quantity: `${quantityStr} ${unitStr}`.trim().replace(/ +/g, " "), // Combine, trim, and collapse multiple spaces
        description: ingredient.description,
    }
}

export function createProfileSlug(displayName: string | null, userId: string): string {
    const namePart = (displayName || "user").toLowerCase().replace(/[^a-z0-9]+/g, "-")
    return `${namePart}~${userId}`
}

export function createRecipeSlug(title: string, recipeId: string): string {
    const titlePart = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    return `${titlePart}~${recipeId}`
}

export async function hostedImageToBase64(url: string): Promise<string> {
    const { data, contentType } = await hostedImageToBuffer(url)
    return `data:${contentType};base64,${data.toString("base64")}`
}

export async function hostedImageToBuffer(
    url: string
): Promise<{ data: Buffer; contentType: string; extension: string }> {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
        }
        const blob = await response.blob()
        const contentType = blob.type || "image/jpeg" // Default to jpeg if type is missing
        const extension = contentType.split("/")[1] || "jpg"

        return {
            data: Buffer.from(await blob.arrayBuffer()),
            contentType,
            extension,
        }
    } catch (error) {
        console.error(`Failed to process image from url: ${url}`, error)
        // Fallback to a placeholder image
        const base64Data = TINY_PLACEHOLDER_IMAGE.split(",")[1]
        return {
            data: Buffer.from(base64Data, "base64"),
            contentType: "image/png",
            extension: "png",
        }
    }
}

export async function resignImageUrl(supabase: SupabaseClient, url: string): Promise<string> {
    // Parse the file storage path from the url (between /sign/${bucket}/ and ?token=)
    const [, bucket, fileStoragePath] = url.match(/\/sign\/(.*?)\/(.*?)\?token=/) || []

    if (!bucket || !fileStoragePath) {
        throw new Error("Invalid image url")
    }

    // Resign the url with the new file storage path
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileStoragePath, 60 * 60 * 24)
    if (error) {
        throw new Error("Failed to resign image url")
    }
    return data.signedUrl
}

export function getHostnameFromUrl(url: string): string {
    try {
        return new URL(url).hostname
    } catch {
        console.error("Invalid URL provided to getHostnameFromUrl:", url)
        return ""
    }
}

export function getServerBaseUrl(headers: Headers): string {
    const host = headers.get("host")
    const protocol = host?.includes("localhost") ? "http" : "https"
    return `${protocol}://${host}`
}

/**
 * Formats a number for display, showing large numbers in "k" format
 * @param num The number to format
 * @returns Formatted string (e.g. 1234 -> "1.2k", 999 -> "999", 1000 -> "1k")
 */
export function formatNumber(num: number): string {
    if (num < 1000) {
        return num.toString()
    }

    const thousands = num / 1000

    // If it's a whole number of thousands, show without decimal
    if (thousands % 1 === 0) {
        return `${thousands}k`
    }

    // Otherwise show one decimal place
    return `${thousands.toFixed(1)}k`
}

/**
 * Formats a timestamp to relative time using javascript-time-ago library
 * Provides consistent, localized time formatting with proper edge case handling
 */
export function formatRelativeTime(timestamp: string): string {
    try {
        return timeAgo.format(new Date(timestamp))
    } catch (error) {
        // Fallback to simple date formatting if TimeAgo fails
        console.error("Error formatting time with TimeAgo:", error)
        const date = new Date(timestamp)
        return date.toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }
}
