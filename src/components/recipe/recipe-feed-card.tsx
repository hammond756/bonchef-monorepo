"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Recipe } from "@/lib/types"
import { Card } from "@/components/ui/card"
import Image from "next/image"

import { cn } from "@/lib/utils"

import { RecipeActionButtons } from "./recipe-action-buttons"
import { CommentOverlay } from "@/components/comment-overlay"

interface RecipeFeedCardProps {
    recipe: Recipe
}

export function RecipeFeedCard({ recipe }: RecipeFeedCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [overlayHeight, setOverlayHeight] = useState("29%")
    const [isCommentOverlayOpen, setIsCommentOverlayOpen] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    const caption = recipe.description || ""
    // A rough approximation. We can refine this if we have a better way to check if text will clamp.
    const isLongCaption = caption.length > 80

    useEffect(() => {
        if (isExpanded) {
            const height = contentRef.current?.scrollHeight
            if (height) {
                setOverlayHeight(`${height + 48}px`)
            }
        } else {
            setOverlayHeight("29%")
        }
    }, [isExpanded, recipe.description, recipe.title])

    const handleToggleExpand = (e: React.MouseEvent) => {
        if (isLongCaption) {
            e.preventDefault()
            e.stopPropagation()
            setIsExpanded(!isExpanded)
        }
    }

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
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300"
                        style={{ height: overlayHeight }}
                    />
                </Link>

                <div
                    ref={contentRef}
                    className="absolute right-0 bottom-0 left-0 p-4 pr-20 text-white"
                >
                    <div
                        className="relative mb-2"
                        onClick={handleToggleExpand}
                        style={{ cursor: isLongCaption ? "pointer" : "default" }}
                    >
                        {isExpanded ? (
                            <>
                                <p className="text-xs">{caption}</p>
                                <span className="cursor-pointer text-xs font-semibold text-gray-300 hover:text-white">
                                    minder
                                </span>
                            </>
                        ) : (
                            <>
                                <p className={cn("line-clamp-2 text-xs", isLongCaption && "pr-12")}>
                                    {caption}
                                </p>
                                {isLongCaption && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-end justify-end">
                                        <span className="text-xs font-semibold text-gray-300">
                                            ... meer
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <h2 className="line-clamp-2 text-2xl leading-tight font-bold">
                        {recipe.title}
                    </h2>
                    <p className="mt-1 text-xs">
                        door {recipe.profiles?.display_name || "een anonieme chef"}
                    </p>
                </div>

                <div className="absolute right-4 bottom-4">
                    <RecipeActionButtons
                        recipe={recipe}
                        theme="dark"
                        shareButtonSize="md"
                        bookmarkButtonSize="md"
                        avatarSize="lg"
                        onCommentClick={() => setIsCommentOverlayOpen(true)}
                    />
                </div>
            </Card>

            <CommentOverlay
                isOpen={isCommentOverlayOpen}
                onClose={() => setIsCommentOverlayOpen(false)}
                recipe={recipe}
            />
        </div>
    )
}
