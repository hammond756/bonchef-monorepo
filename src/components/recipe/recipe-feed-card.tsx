"use client"

import { useState } from "react"
import Link from "next/link"
import { Recipe } from "@/lib/types"
import { Card } from "@/components/ui/card"
import Image from "next/image"

import { RecipeActionButtons } from "./recipe-action-buttons"

interface RecipeFeedCardProps {
    recipe: Recipe
}

const MAX_CAPTION_LENGTH = 100

export function RecipeFeedCard({ recipe }: RecipeFeedCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const caption = recipe.description || ""
    const isLongCaption = caption.length > MAX_CAPTION_LENGTH
    const displayedCaption =
        isLongCaption && !isExpanded ? `${caption.substring(0, MAX_CAPTION_LENGTH)}...` : caption

    return (
        <div className="w-full snap-center px-4">
            <Card className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                <Link href={`/recipes/${recipe.id}`} className="absolute inset-0">
                    <Image
                        src={recipe.thumbnail || "https://placekitten.com/900/1200"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 75vw"
                    />
                    <div
                        className={`absolute inset-0 transition-all duration-300 ${
                            isExpanded
                                ? "bg-gradient-to-t from-black/60 via-black/40 to-black/20"
                                : "bg-gradient-to-t from-black/50 via-black/20 to-transparent"
                        }`}
                    />
                </Link>

                <div className="absolute right-0 bottom-0 left-0 p-6 pr-20 text-white">
                    <div className="mb-4">
                        <p className="text-sm">
                            {displayedCaption}
                            {isLongCaption && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setIsExpanded(!isExpanded)
                                    }}
                                    className="ml-1 font-semibold text-gray-300 hover:text-white"
                                >
                                    {isExpanded ? "minder" : "meer"}
                                </button>
                            )}
                        </p>
                    </div>
                    <h2 className="line-clamp-3 text-2xl leading-tight font-bold">
                        {recipe.title}
                    </h2>
                    <p className="mt-1 text-sm">
                        door {recipe.profiles?.display_name || "een anonieme chef"}
                    </p>
                </div>
                <div className="absolute right-8 bottom-3">
                    <RecipeActionButtons
                        recipe={recipe}
                        theme="dark"
                        shareButtonSize="md"
                        likeButtonSize="md"
                        avatarSize="lg"
                    />
                </div>
            </Card>
        </div>
    )
}
