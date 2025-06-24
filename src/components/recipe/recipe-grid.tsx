"use client"

import Link from "next/link"
import Image from "next/image"
import { RecipeRead } from "@/lib/types"
import { LikeButton } from "@/components/like-button"
import { Skeleton } from "../ui/skeleton"

export function RecipeGrid({ recipes }: { recipes: RecipeRead[] }) {
    if (!recipes || recipes.length === 0) {
        return
    }

    return (
        <div className="grid grid-cols-2 gap-6">
            {recipes.map((recipe) => (
                <div
                    key={recipe.id}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg"
                >
                    <Link href={`/recipes/${recipe.id}`} className="block h-full w-full">
                        <div className="relative aspect-square rounded-lg">
                            <Image
                                src={recipe.thumbnail}
                                alt={recipe.title}
                                fill
                                className="rounded-lg object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                            />
                            <div className="absolute top-2 right-2 z-10">
                                <LikeButton
                                    recipeId={recipe.id}
                                    initialLiked={recipe.is_liked_by_current_user ?? false}
                                    initialLikeCount={recipe.like_count || 0}
                                />
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-white/70 p-3">
                            <h2 className="text-md line-clamp-2 font-semibold text-gray-800">
                                {recipe.title}
                            </h2>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    )
}

export function RecipeGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="relative aspect-4/3 overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                </div>
            ))}
        </div>
    )
}
