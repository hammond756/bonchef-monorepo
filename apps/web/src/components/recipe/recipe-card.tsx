"use client"

import { Recipe } from "@/lib/types"
import Link from "next/link"
import { BookmarkButton } from "@/components/bookmark-button"
import { Badge } from "@/components/ui/badge"
import { cn, createRecipeSlug } from "@/lib/utils"
import Image from "next/image"

function RecipeCardTitle({ title, subTitle }: { title: string; subTitle?: string }) {
    return (
        <div className="absolute bottom-0 left-0 z-10 p-4">
            <h3
                className="text-surface line-clamp-2 text-base font-bold"
                aria-label={`Recept Naam: ${title}`}
            >
                {title}
            </h3>
            {subTitle && <p className="text-xs text-slate-200">{subTitle}</p>}
        </div>
    )
}

function RecipeCardContainer({ children, href }: { children: React.ReactNode; href?: string }) {
    return (
        <Link
            href={href || "#"}
            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-lg"
        >
            <div className="absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            {children}
        </Link>
    )
}

export function RecipeCard({ recipe }: { readonly recipe: Recipe }) {
    const isDraft = recipe.status === "DRAFT"
    const shouldBlur = isDraft
    const href = isDraft
        ? `/edit/${recipe.id}`
        : `/recipes/${createRecipeSlug(recipe.title, recipe.id)}`

    return (
        <RecipeCardContainer href={href}>
            <RecipeCardTitle title={recipe.title} />

            {isDraft && (
                <div className="absolute top-2 left-2 z-10">
                    <Badge variant="yellow">Concept</Badge>
                </div>
            )}

            <Image
                src={recipe.thumbnail}
                alt={`Afbeelding van ${recipe.title}`}
                className={cn(
                    "z-5 object-cover transition-transform duration-300 [color-rendering:optimizeSpeed] group-hover:scale-105",
                    shouldBlur && "blur-sm"
                )}
                fill
                priority={false}
            />

            <div className="absolute top-2 right-2 z-10">
                <BookmarkButton
                    recipeId={recipe.id}
                    showCount={false}
                    theme="dark"
                    initialBookmarked={recipe.is_bookmarked_by_current_user ?? false}
                    initialBookmarkCount={recipe.bookmark_count || 0}
                />
            </div>
        </RecipeCardContainer>
    )
}

// Export helper components for use in other components
export { RecipeCardContainer, RecipeCardTitle }
