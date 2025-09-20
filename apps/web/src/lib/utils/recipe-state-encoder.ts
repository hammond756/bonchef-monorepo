import type { IngredientIndexRef, RecipeState } from "@/hooks/use-recipe-state"
import { getOrigin } from "./window"

/**
 * Encodes recipe state using a compact binary varint scheme and Base64URL.
 * Keeps URLs small and under typical 256-char constraints for realistic inputs.
 */

// --- Base64URL helpers (Node + Browser compatible) ---

function base64UrlEncode(bytes: Uint8Array): string {
    const hasBuffer = typeof globalThis.Buffer !== "undefined"
    const base64 = hasBuffer
        ? globalThis.Buffer.from(bytes).toString("base64")
        : btoa(String.fromCharCode(...bytes))

    // Safe Regex: Simple character replacements with no backtracking risk,
    // no need to sanitize input.
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlDecode(input: string): Uint8Array {
    // Safe Regex: Simple character replacements with no backtracking risk,
    // no need to sanitize input.
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    const padLength = (4 - (base64.length % 4)) % 4
    const padded = base64 + "=".repeat(padLength)

    const hasBuffer = typeof globalThis.Buffer !== "undefined"
    if (hasBuffer) {
        const buf = globalThis.Buffer.from(padded, "base64")
        return new Uint8Array(buf)
    }
    const binary = atob(padded)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
    return out
}

// --- Varint encoding for non-negative integers ---

function writeVarint(value: number, out: number[]): void {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("varint: invalid value")
    while (value >= 0x80) {
        out.push((value & 0x7f) | 0x80)
        value >>>= 7
    }
    out.push(value)
}

function readVarint(bytes: Uint8Array, offset: { i: number }): number {
    let result = 0
    let shift = 0
    while (true) {
        if (offset.i >= bytes.length || shift > 35) throw new Error("varint: overflow")
        const b = bytes[offset.i++]
        result |= (b & 0x7f) << shift
        if ((b & 0x80) === 0) return result
        shift += 7
    }
}

// --- Public API ---

/**
 * Encode a recipe state to a compact Base64URL string.
 */
export function encodeRecipeState(state: RecipeState): string {
    const buf: number[] = []
    writeVarint(state.version, buf)
    writeVarint(state.portions, buf)

    // checkedIngredients
    writeVarint(state.checkedIngredients.length, buf)
    for (const ref of state.checkedIngredients) {
        writeVarint(ref.groupIndex, buf)
        writeVarint(ref.ingredientIndex, buf)
    }

    // checkedSteps
    writeVarint(state.checkedSteps.length, buf)
    for (const s of state.checkedSteps) writeVarint(s, buf)

    return base64UrlEncode(new Uint8Array(buf))
}

export type DecodeResult = { success: true; data: RecipeState } | { success: false; error: string }

/**
 * Decode a recipe state from a Base64URL string.
 */
export function decodeRecipeState(encoded: string): DecodeResult {
    try {
        const bytes = base64UrlDecode(encoded)
        const off = { i: 0 }
        const version = readVarint(bytes, off)
        const portions = readVarint(bytes, off)

        const ingLen = readVarint(bytes, off)
        const checkedIngredients: IngredientIndexRef[] = []
        for (let k = 0; k < ingLen; k++) {
            const groupIndex = readVarint(bytes, off)
            const ingredientIndex = readVarint(bytes, off)
            checkedIngredients.push({ groupIndex, ingredientIndex })
        }

        const stepsLen = readVarint(bytes, off)
        const checkedSteps: number[] = []
        for (let k = 0; k < stepsLen; k++) checkedSteps.push(readVarint(bytes, off))

        // Basic validation
        if (version !== 1) return { success: false, error: "unsupported_version" }
        if (!Number.isSafeInteger(portions) || portions <= 0)
            return { success: false, error: "invalid_portions" }

        return {
            success: true,
            data: { version, portions, checkedIngredients, checkedSteps },
        }
    } catch {
        return { success: false, error: "decode_failed" }
    }
}

/**
 * Attach encoded state to a URL under the short key `rs`.
 */
export function buildUrlWithState(url: string, state: RecipeState): string {
    const encoded = encodeRecipeState(state)
    const u = new URL(url, getOrigin())
    u.searchParams.set("rs", encoded)
    return u.toString()
}

/**
 * Remove state parameter from a URL.
 */
export function removeStateFromUrl(url: string): string {
    const u = new URL(url, getOrigin())
    u.searchParams.delete("rs")
    return u.toString()
}

/**
 * Extract state from a URL if present; returns null when parameter missing.
 */
export function extractStateFromUrl(
    url: string
): { success: true; data: RecipeState | null } | { success: false; error: string } {
    try {
        const u = new URL(url, getOrigin())
        const encoded = u.searchParams.get("rs")
        if (!encoded) return { success: true, data: null }
        const res = decodeRecipeState(encoded)
        if (!res.success) return { success: false, error: res.error }
        return { success: true, data: res.data }
    } catch {
        return { success: false, error: "url_parse_failed" }
    }
}
