"use client";

import Link from "next/link";
import Image from "next/image";
import { RecipeRead } from "@/lib/types";
import { LikeButton } from "@/components/like-button";
import { Skeleton } from "../ui/skeleton";

export function RecipeGrid({ recipes }: { recipes: RecipeRead[] }) {
    if (!recipes || recipes.length === 0) {
      return
    }
  
    return (
      <div className="grid grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
            <Link
              href={`/recipes/${recipe.id}`}
              className="block w-full h-full"
            >
              <div className="relative aspect-square rounded-lg">
                <Image
                  src={recipe.thumbnail}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                />
                <div className="absolute top-4 right-4">
                  <LikeButton recipeId={recipe.id} initialLiked={recipe.is_liked_by_current_user} initialLikeCount={recipe.like_count} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/70 rounded-b-lg">
                <h2 className="text-md font-semibold text-gray-800 line-clamp-2">
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
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Skeleton className="h-full w-full" />
            </div>
            ))}
        </div>
    )
}