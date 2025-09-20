import { CollectionItem } from "./recipe-grid"
import { InProgressRecipeListItem, RecipeListItem } from "@/components/recipe/recipe-list-item"

interface RecipeListProps {
    items: Readonly<CollectionItem[]>
}

/**
 * Renders a list of recipe items and job items
 */
export function RecipeList({ items }: RecipeListProps) {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {items.map((item) =>
                item.viewType === "RECIPE" ? (
                    <RecipeListItem key={item.id} recipe={item} />
                ) : (
                    <InProgressRecipeListItem key={item.id} job={item} />
                )
            )}
        </div>
    )
}
