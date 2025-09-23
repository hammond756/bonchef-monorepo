/**
 * Utility functions for formatting ingredient data
 */

export interface Ingredient {
    description: string;
    quantity: {
        low: number;
        high?: number;
    };
    unit: string;
}

/**
 * Converts a decimal number to a fraction string
 * @param num - The decimal number to convert
 * @returns A string representation of the number as a fraction
 */
function numberToFraction(num: number): string {
    if (num === 0) return "0";
    
    // Handle common fractions with higher precision
    const commonFractions = [
        { decimal: 0.125, fraction: "1/8" },
        { decimal: 0.25, fraction: "1/4" },
        { decimal: 0.333, fraction: "1/3" },
        { decimal: 0.375, fraction: "3/8" },
        { decimal: 0.5, fraction: "1/2" },
        { decimal: 0.625, fraction: "5/8" },
        { decimal: 0.667, fraction: "2/3" },
        { decimal: 0.75, fraction: "3/4" },
        { decimal: 0.875, fraction: "7/8" }
    ];
    
    // Check for exact matches with common fractions
    for (const cf of commonFractions) {
        if (Math.abs(num - cf.decimal) < 0.01) {
            return cf.fraction;
        }
    }
    
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = num;
    
    do {
        const a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(num - h1 / k1) > num * tolerance);
    
    if (k1 === 1) return h1.toString();
    
    // Convert to mixed number if the fraction is improper (numerator > denominator)
    if (h1 > k1) {
        const whole = Math.floor(h1 / k1);
        const remainder = h1 % k1;
        if (remainder === 0) {
            return whole.toString();
        }
        return `${whole} ${remainder}/${k1}`;
    }
    
    return `${h1}/${k1}`;
}

/**
 * Formats an ingredient line with quantity and description
 * @param ingredient - The ingredient object to format
 * @param multiplier - The multiplier to apply to the quantity
 * @returns Formatted quantity and description, or null if invalid
 * @throws {Error} If multiplier is not positive
 */
export function formatIngredientLine(
    ingredient: Ingredient,
    multiplier: number = 1
): { quantity: string; description: string } | null {
    if (!ingredient || typeof ingredient.description !== "string") {
        return null;
    }

    // Validate multiplier
    if (multiplier <= 0) {
        throw new Error("Multiplier must be a positive number");
    }

    // Check if ingredient has quantity data
    if (!ingredient.quantity || !ingredient.quantity.low) {
        // No quantity - just return the description
        return {
            quantity: "",
            description: ingredient.description,
        };
    }

    // Per user request, always display the lowest number of the range.
    // The long-term fix is to adjust the LLM prompt to only generate ranges for specific terms.
    const low = ingredient.quantity.low * multiplier;
    const unit = ingredient.unit;

    // Define which units should always be displayed as decimals instead of fractions.
    const decimalUnits = ["kg", "l"];
    const shouldUseDecimal = decimalUnits.includes(unit);

    let quantityStr = "";

    if (low > 0) {
        if (shouldUseDecimal) {
            // For specified units, use decimals (e.g., 1.5 kg)
            const formatDecimal = (num: number) => {
                const rounded = parseFloat(num.toFixed(2));
                return rounded.toString();
            };
            quantityStr = formatDecimal(low);
        } else {
            // For all other units, use fractions (e.g., 1 1/2 tl)
            quantityStr = numberToFraction(low);
        }
    }

    // Don't display the unit if it is 'none' or empty
    const unitStr = unit?.trim() && unit.toLowerCase() !== "none" ? unit : "";

    return {
        quantity: `${quantityStr} ${unitStr}`.trim().replace(/ +/g, " "), // Combine, trim, and collapse multiple spaces
        description: ingredient.description,
    };
}
