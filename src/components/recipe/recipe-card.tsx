"use client"

import { Recipe } from "@/lib/types"
import Link from "next/link"
import { LikeButton } from "@/components/like-button"

interface RecipeCardProps {
    recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link
            href={`/recipes/${recipe.id}`}
            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-lg"
        >
            <div
                style={{ backgroundImage: `url(${recipe.thumbnail})` }}
                className="h-full w-full bg-cover bg-center transition-transform duration-300 [color-rendering:optimizeSpeed] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-surface line-clamp-2 text-base font-bold">{recipe.title}</h3>
            </div>

            <div className="absolute top-2 right-2">
                <LikeButton
                    recipeId={recipe.id}
                    initialLiked={!!recipe.is_liked_by_current_user}
                    initialLikeCount={recipe.like_count || 0}
                    showCount={false}
                    theme="dark"
                />
            </div>
        </Link>
    )
}
