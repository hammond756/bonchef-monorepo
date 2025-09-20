import { Recipe } from "../types"

/**
 * Recipe validation logic
 */

export interface RecipeValidationErrors {
    title?: string
    cookingTime?: string
    servings?: string
    description?: string
    ingredients?: string
    steps?: string
    image?: string
    sourceUrl?: string
    sourceName?: string
}

/**
 * Validate recipe title
 */
export function validateTitle(title: string): string | undefined {
    if (!title || title.trim().length === 0) {
        return "Recept titel is verplicht"
    }

    if (title.trim().length < 3) {
        return "Recept titel moet minimaal 3 karakters bevatten"
    }

    if (title.trim().length > 100) {
        return "Recept titel mag maximaal 100 karakters bevatten"
    }

    return undefined
}

/**
 * Validate cooking time
 */
export function validateCookingTime(cookingTime: number): string | undefined {
    if (!cookingTime || cookingTime <= 0) {
        return "Kooktijd moet groter zijn dan 0"
    }

    if (cookingTime > 480) {
        // 8 hours
        return "Kooktijd mag niet meer dan 8 uur zijn"
    }

    return undefined
}

/**
 * Validate servings
 */
export function validateServings(servings: number): string | undefined {
    if (!servings || servings <= 0) {
        return "Aantal personen moet groter zijn dan 0"
    }

    if (servings > 50) {
        return "Aantal personen mag niet meer dan 50 zijn"
    }

    return undefined
}

/**
 * Validate description
 */
export function validateDescription(description: string | undefined): string | undefined {
    if (!description) return undefined
    if (description.length > 500) {
        return "Beschrijving mag maximaal 500 karakters bevatten"
    }
    return undefined
}

/**
 * Validate ingredients
 */
export function validateIngredients(ingredients: Recipe["ingredients"]): string | undefined {
    if (!ingredients || ingredients.length === 0) {
        return "Ten minste één ingrediënt is verplicht"
    }

    for (const group of ingredients) {
        if (!group.name || group.name.trim().length === 0) {
            return "Alle ingrediënt groepen moeten een naam hebben"
        }

        if (!group.ingredients || group.ingredients.length === 0) {
            return `Groep "${group.name}" heeft geen ingrediënten`
        }

        for (const ingredient of group.ingredients) {
            if (!ingredient.description || ingredient.description.trim().length === 0) {
                return "Alle ingrediënten moeten een naam hebben"
            }

            // Unit and quantity are optional - only the description is required
        }
    }

    return undefined
}

/**
 * Validate steps
 */
export function validateSteps(steps: string[]): string | undefined {
    if (!steps || steps.length === 0) {
        return "Ten minste één bereidingsstap is verplicht"
    }

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]

        if (!step || step.trim().length === 0) {
            return `Stap ${i + 1} mag niet leeg zijn`
        }

        if (step.trim().length < 5) {
            return `Stap ${i + 1} moet minimaal 5 karakters bevatten`
        }

        if (step.trim().length > 500) {
            return `Stap ${i + 1} mag maximaal 500 karakters bevatten`
        }
    }

    return undefined
}

/**
 * Validate image (optional)
 */
export function validateImage(imageUrl?: string | null): string | undefined {
    if (!imageUrl) {
        return undefined // Image is optional
    }

    // Basic URL validation
    try {
        new URL(imageUrl)
    } catch {
        return "Ongeldige afbeelding URL"
    }

    return undefined
}

/**
 * Validate source URL (optional)
 */
export function validateSourceUrl(sourceUrl?: string | null): string | undefined {
    if (!sourceUrl) {
        return undefined // Source URL is optional
    }

    // Basic URL validation
    try {
        new URL(sourceUrl)
    } catch {
        return "Ongeldige URL"
    }

    if (sourceUrl.length > 2047) {
        return "URL mag maximaal 2047 karakters bevatten"
    }

    return undefined
}

/**
 * Validate source name when source URL is provided
 */
export function validateSourceName(
    sourceName?: string | null,
    sourceUrl?: string | null
): string | undefined {
    // If source URL is provided, source name is required
    if (sourceUrl && sourceUrl.trim().length > 0) {
        if (!sourceName || sourceName.trim().length === 0) {
            return "Voer de bron naam van je link in voordat je verder gaat"
        }
    }

    return undefined
}

/**
 * Validate complete recipe data
 */
export function validateRecipe(recipe: Recipe): RecipeValidationErrors {
    const errors: RecipeValidationErrors = {}

    const titleError = validateTitle(recipe.title)
    if (titleError) errors.title = titleError

    const cookingTimeError = validateCookingTime(recipe.total_cook_time_minutes)
    if (cookingTimeError) errors.cookingTime = cookingTimeError

    const servingsError = validateServings(recipe.n_portions)
    if (servingsError) errors.servings = servingsError

    const descriptionError = validateDescription(recipe.description)
    if (descriptionError) errors.description = descriptionError

    const ingredientsError = validateIngredients(recipe.ingredients)
    if (ingredientsError) errors.ingredients = ingredientsError

    const stepsError = validateSteps(recipe.instructions)
    if (stepsError) errors.steps = stepsError

    const imageError = validateImage(recipe.thumbnail)
    if (imageError) errors.image = imageError

    const sourceUrlError = validateSourceUrl(recipe.source_url)
    if (sourceUrlError) errors.sourceUrl = sourceUrlError

    const sourceNameError = validateSourceName(recipe.source_name, recipe.source_url)
    if (sourceNameError) errors.sourceName = sourceNameError

    return errors
}

/**
 * Check if recipe is valid (no errors)
 */
export function isRecipeValid(recipe: Recipe): boolean {
    const errors = validateRecipe(recipe)
    return Object.keys(errors).length === 0
}

/**
 * Get field-specific validation error
 */
export function getFieldError(
    field: keyof RecipeValidationErrors,
    recipe: Recipe
): string | undefined {
    const errors = validateRecipe(recipe)
    return errors[field]
}

/**
 * Check if a specific field is valid
 */
export function isFieldValid(field: keyof RecipeValidationErrors, recipe: Recipe): boolean {
    return !getFieldError(field, recipe)
}
