import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"
import { Ingredient, RecipeWrite } from "./types"
import { TINY_PLACEHOLDER_IMAGE } from "@/utils/contants"
import { GeneratedRecipe } from "./types"
import { SupabaseClient } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }
    return text.substring(0, maxLength - 3) + "..."
}

export function computeMD5(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex")
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

export const unitMap: Record<
    string,
    { nl: { singular: string; plural: string }; en: { singular: string; plural: string } }
> = {
    gram: {
        nl: { singular: "g", plural: "g" },
        en: { singular: "g", plural: "g" },
    },
    kilogram: {
        nl: { singular: "kg", plural: "kg" },
        en: { singular: "kilogram", plural: "kilograms" },
    },
    milligram: {
        nl: { singular: "mg", plural: "mg" },
        en: { singular: "mg", plural: "mg" },
    },
    milliliter: {
        nl: { singular: "ml", plural: "ml" },
        en: { singular: "ml", plural: "ml" },
    },
    liter: {
        nl: { singular: "l", plural: "l" },
        en: { singular: "l", plural: "l" },
    },
    teaspoon: {
        nl: { singular: "tl", plural: "tl" },
        en: { singular: "tsp", plural: "tsp" },
    },
    tablespoon: {
        nl: { singular: "el", plural: "el" },
        en: { singular: "tbsp", plural: "tbsp" },
    },
    piece: {
        nl: { singular: "stuk", plural: "stukken" },
        en: { singular: "piece", plural: "pieces" },
    },
    slice: {
        nl: { singular: "plak", plural: "plakken" },
        en: { singular: "slice", plural: "slices" },
    },
    whole: {
        nl: { singular: "", plural: "" },
        en: { singular: "", plural: "" },
    },
    clove: {
        nl: { singular: "teentje", plural: "teentjes" },
        en: { singular: "clove", plural: "cloves" },
    },
    bunch: {
        nl: { singular: "bos", plural: "bossen" },
        en: { singular: "bunch", plural: "bunches" },
    },
    centimeter: {
        nl: { singular: "cm", plural: "cm" },
        en: { singular: "cm", plural: "cm" },
    },
    pinch: {
        nl: { singular: "snufje", plural: "snufjes" },
        en: { singular: "pinch", plural: "pinches" },
    },
    dash: {
        nl: { singular: "scheutje", plural: "scheutjes" },
        en: { singular: "dash", plural: "dashes" },
    },
    handful: {
        nl: { singular: "handjevol", plural: "handjevol" },
        en: { singular: "handful", plural: "handfuls" },
    },
    can: {
        nl: { singular: "blik", plural: "blikken" },
        en: { singular: "can", plural: "cans" },
    },
    jar: {
        nl: { singular: "pot", plural: "potten" },
        en: { singular: "jar", plural: "jars" },
    },
    pack: {
        nl: { singular: "pak", plural: "pakken" },
        en: { singular: "pack", plural: "packs" },
    },
    sheet: {
        nl: { singular: "vel", plural: "vellen" },
        en: { singular: "sheet", plural: "sheets" },
    },
    block: {
        nl: { singular: "blok", plural: "blokken" },
        en: { singular: "block", plural: "blocks" },
    },
    sprig: {
        nl: { singular: "takje", plural: "takjes" },
        en: { singular: "sprig", plural: "sprigs" },
    },
    scoop: {
        nl: { singular: "schep", plural: "scheppen" },
        en: { singular: "scoop", plural: "scoops" },
    },
    cup: {
        nl: { singular: "cup", plural: "cups" },
        en: { singular: "cup", plural: "cups" },
    },
    none: {
        nl: { singular: "", plural: "" },
        en: { singular: "", plural: "" },
    },
}

export function formatIngredientLine(
    ingredient: Ingredient,
    multiplier: number
): { quantity: string; description: string } | null {
    if (!ingredient || typeof ingredient.description !== "string") {
        return null
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

    // Don't display the unit if it is 'none'
    const unitStr = unit && unit.toLowerCase() !== "none" ? unit : ""

    return {
        quantity: `${quantityStr} ${unitStr}`.trim().replace(/ +/g, " "), // Combine, trim, and collapse multiple spaces
        description: ingredient.description,
    }
}

export function parseDescription(text: string): Array<{ type: "text" | "url"; content: string }> {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part) => {
        if (part.match(urlRegex)) {
            return { type: "url", content: part }
        }
        return { type: "text", content: part }
    })
}

export function createProfileSlug(displayName: string | null, userId: string): string {
    const namePart = (displayName || "user").toLowerCase().replace(/[^a-z0-9]+/g, "-")
    return `${namePart}~${userId}`
}

export function createRecipeSlug(title: string, recipeId: string): string {
    const titlePart = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    return `${titlePart}~${recipeId}`
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
}

export async function hostedImageToBase64(url: string): Promise<string> {
    const { data, contentType } = await hostedImageToBuffer(url)
    return `data:${contentType};base64,${data.toString("base64")}`
}

export async function hostedImageToBuffer(
    url: string
): Promise<{ data: Buffer; contentType: string; extension: string }> {
    const response = await fetch(url)
    const blob = await response.blob()
    return {
        data: Buffer.from(await blob.arrayBuffer()),
        contentType: blob.type,
        extension: blob.type.split("/")[1],
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
