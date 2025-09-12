import { Text } from "react-native"
import { Recipe } from "../../lib/types"

interface RecipeSourceDisplayProps {
    recipe: Recipe
}

/**
 * Displays the source information for a recipe
 * Shows external source, source name, or user profile
 */
export function RecipeSourceDisplay({ recipe }: Readonly<RecipeSourceDisplayProps>) {
    // Check if there's an external source URL (not BonChef)
    if (recipe.source_url && recipe.source_url !== "https://app.bonchef.io") {
        const sourceName = recipe.source_name && recipe.source_name !== "BonChef" 
            ? recipe.source_name 
            : getHostnameFromUrl(recipe.source_url)
        
        return (
            <Text className="text-xs text-white/70">
                van {sourceName}
            </Text>
        )
    }

    // Check if there's a source name without URL
    if (recipe.source_name && recipe.source_name !== "BonChef") {
        return (
            <Text className="text-xs text-white/70">
                van {recipe.source_name}
            </Text>
        )
    }

    // Fallback to user profile
    return (
        <Text className="text-xs text-white/70">
            van {recipe.profiles?.display_name || "een anonieme chef"}
        </Text>
    )
}

/**
 * Extracts hostname from URL for display
 */
function getHostnameFromUrl(url: string): string {
    try {
        const urlObj = new URL(url)
        return urlObj.hostname.replace("www.", "")
    } catch {
        return url
    }
}
