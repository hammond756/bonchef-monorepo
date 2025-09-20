import Link from "next/link"
import { Recipe } from "@/lib/types"
import { getHostnameFromUrl } from "@/lib/utils"

interface RecipeSourceDisplayProps {
    recipe: Recipe
}

export function RecipeSourceDisplay({ recipe }: Readonly<RecipeSourceDisplayProps>) {
    // Check if there's an external source URL (not BonChef)
    if (recipe.source_url && recipe.source_url !== "https://app.bonchef.io") {
        return (
            <>
                van{" "}
                {recipe.source_name && recipe.source_name !== "BonChef" ? (
                    <a
                        href={recipe.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-300"
                        data-testid="external-source-link"
                    >
                        {recipe.source_name}
                    </a>
                ) : (
                    <a
                        href={recipe.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-300"
                        data-testid="hostname-source-link"
                    >
                        {getHostnameFromUrl(recipe.source_url)}
                    </a>
                )}
            </>
        )
    }

    // Check if there's a source name without URL
    if (recipe.source_name && recipe.source_name !== "BonChef") {
        return (
            <>
                van <span className="text-surface/70">{recipe.source_name}</span>
            </>
        )
    }

    // Fallback to user profile
    return (
        <>
            van{" "}
            <Link
                href={`/profiles/~${recipe.profiles?.id}`}
                className="hover:text-gray-300"
                onClick={(e) => e.stopPropagation()}
                data-testid="user-profile-link"
            >
                {recipe.profiles?.display_name || "een anonieme chef"}
            </Link>
        </>
    )
}
